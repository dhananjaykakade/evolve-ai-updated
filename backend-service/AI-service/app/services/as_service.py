import requests
import os
import fitz  # PyMuPDF for PDF text extraction
import re
import json
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"

async def check_assignment(file, out_of_marks, check_prompt):
    """ Extracts text from a PDF assignment and sends it to Gemini AI for evaluation. """
    
    if not GEMINI_API_KEY:
        raise ValueError(" Gemini API Key is missing. Set it in the .env file.")

    print("Extracting text from PDF...")
    pdf_text = extract_text_from_pdf(file)
    print(f"Extracted PDF text (first 200 chars): {pdf_text[:200]}")  # Debug print

    prompt = f"""
    You are an AI-based assignment evaluator. Carefully review the student's submission.
    
    **Assignment Submission:**
    {pdf_text}
    
    **Evaluation Criteria:**
    {check_prompt}

    **Marking Scheme:**
    - Maximum Marks: {out_of_marks}

    **Response Format (Important! Return JSON only):**
    {{
      "feedback": "Your detailed feedback here.",
      "marks_scored": <marks out of {out_of_marks}>
    }}
    """

    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}

    print(" Sending request to Gemini API...")  # Debug print
    try:
        response = requests.post(
            f"{API_URL}?key={GEMINI_API_KEY}",
            json=payload,
            headers=headers,
            timeout=10  # Added timeout to prevent infinite loading
        )
        response.raise_for_status()
        result = response.json()
        print(" Gemini API Response Received!")  # Debug print

        # Extract feedback
        feedback = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No feedback generated.")

        # Extract marks correctly
        marks_scored = extract_marks(feedback, out_of_marks)

        return {
            "feedback": feedback,
            "marks_scored": marks_scored
        }

    except requests.exceptions.RequestException as e:
        print(f" Error calling Gemini API: {str(e)}")
        raise Exception(f" Error calling Gemini API: {str(e)}")

def extract_text_from_pdf(file):
    """ Extracts text from a PDF file. """
    try:
        pdf_bytes = file.file.read()  # Read file bytes
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = "\n".join([page.get_text("text") for page in doc])
        return text.strip() if text else "No readable text found in PDF."
    except Exception as e:
        print(f" Error extracting text from PDF: {str(e)}")
        return "No readable text found in PDF."

def extract_marks(feedback, out_of_marks):
    """ Extract marks from Gemini's response correctly. """
    
    # Step 1: Remove Markdown code block (```json ... ```)
    json_match = re.search(r"```json\n(.*?)\n```", feedback, re.DOTALL)
    
    if json_match:
        json_text = json_match.group(1)  # Extract JSON string
        try:
            feedback_json = json.loads(json_text)  # Parse as JSON
            return feedback_json.get("marks_scored", "Marks not found in response.")
        except json.JSONDecodeError:
            return " Error parsing feedback JSON."
    
    # Step 2: Fallback to regex-based extraction (if no JSON found)
    match = re.search(r"(\d+)\s*/\s*" + str(out_of_marks), feedback)
    return int(match.group(1)) if match else "Marks not found in response."