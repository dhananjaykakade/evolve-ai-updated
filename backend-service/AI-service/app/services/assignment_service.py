import requests
import os
from dotenv import load_dotenv
from fpdf import FPDF  #  Library for PDF generation
from fastapi.responses import FileResponse

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# API Endpoint for Gemini AI
API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"

def generate_assignment_pdf(subject, assignment_type, word_limit, deadline, topic):
    """ Calls Gemini AI to generate an assignment and converts it into a PDF """

    if not GEMINI_API_KEY:
        raise ValueError(" Gemini API Key is missing. Set it in the .env file.")

    # Prompt for Gemini AI
    prompt = f"""
    Generate an academic assignment with the following details:
    - Subject: {subject}
    - Assignment Type: {assignment_type}
    - Word Limit: {word_limit}
    - Deadline: {deadline}
    - Topic: {topic}
    
    Provide a detailed assignment with instructions and at least 5 AI-generated questions.
    """

    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}

    try:
        response = requests.post(f"{API_URL}?key={GEMINI_API_KEY}", json=payload, headers=headers)
        response.raise_for_status()  # Raises an error for non-200 status codes

        result = response.json()

        #  Extract generated content properly
        assignment_content = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")

        if not assignment_content:
            raise ValueError(" No assignment content generated.")

        # Convert the generated assignment into a PDF
        pdf_filename = create_pdf(subject, assignment_content)
        
        return pdf_filename

    except requests.exceptions.RequestException as e:
        raise Exception(f" Error calling Gemini API: {str(e)}")

def create_pdf(subject, content):
    """ Generates a PDF file from the assignment content """
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    #  Using default Arial font (No external fonts required)
    pdf.set_font("Arial", size=12)

    # Title
    pdf.set_font("Arial", style="B", size=16)
    pdf.cell(200, 10, f"Assignment: {subject}", ln=True, align="C")
    pdf.ln(10)  # New line

    #  Fix encoding issue: Replace non-encodable characters
    content = content.encode('latin-1', 'replace').decode('latin-1')
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, content)

    # Save PDF
    pdf_filename = "assignment.pdf"
    pdf.output(pdf_filename, "F")
    
    return pdf_filename
