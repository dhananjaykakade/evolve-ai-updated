import requests
import os
import fitz  # PyMuPDF
import re
import json
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"

async def check_assignment(file, out_of_marks, check_prompt):
    """Extracts text from a PDF assignment and sends it to Gemini AI for evaluation."""

    if not GEMINI_API_KEY:
        raise ValueError("Gemini API Key is missing. Set it in the .env file.")

    print("Extracting text from PDF...")
    pdf_text = extract_text_from_pdf(file)
    print(f"Extracted PDF text (first 200 chars): {pdf_text[:200]}")

    if not pdf_text or pdf_text == "No readable text found in PDF.":
        return {
            "feedback": "The submitted PDF contains no readable text. Please ensure the file is valid.",
            "marks_scored": 0
        }

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

    try:
        print("Sending request to Gemini API...")
        response = requests.post(
            f"{API_URL}?key={GEMINI_API_KEY}",
            json=payload,
            headers=headers,
            timeout=15
        )
        response.raise_for_status()
        result = response.json()
        print("Gemini API Response Received!")

        feedback = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No feedback generated.")

        # Extract marks from Gemini response
        marks_scored = extract_marks(feedback, out_of_marks)

        return {
            "feedback": feedback,
            "marks_scored": marks_scored
        }

    except requests.exceptions.RequestException as e:
        print(f"Error calling Gemini API: {str(e)}")
        raise Exception(f"Error calling Gemini API: {str(e)}")


def extract_text_from_pdf(file):
    """Extracts text from a PDF file stream (e.g. FastAPI UploadFile)."""
    try:
        pdf_bytes = file.file.read()
        file.file.seek(0)  # Reset pointer for other use if needed
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = "\n".join([page.get_text("text") for page in doc])
        return text.strip() if text else "No readable text found in PDF."
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        return "No readable text found in PDF."


def extract_marks(feedback, out_of_marks):
    """Extracts marks from the feedback JSON or fallback text."""
    
    # Attempt to extract JSON from markdown block
    json_match = re.search(r"```json\s*\n(.*?)\n```", feedback, re.DOTALL)
    if json_match:                               
        try:
            json_data = json.loads(json_match.group(1))
            return json_data.get("marks_scored", "Marks not found.")                                                   
        except json.JSONDecodeError:
            return "Error parsing feedback JSON."

    # Fallback regex method
    match = re.search(r"(\d+)\s*/\s*" + str(out_of_marks), feedback)
    return int(match.group(1)) if match else "Marks not found."

                                                                                                                           