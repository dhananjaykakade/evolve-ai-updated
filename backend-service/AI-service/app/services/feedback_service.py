import requests
import os
from dotenv import load_dotenv

# Load API Key from .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"

def generate_feedback(student_submission, feedback_tone, feedback_focus, feedback_length, include_auto_grading):
    """ Calls Gemini AI to generate feedback """

    if not GEMINI_API_KEY:
        raise ValueError(" Gemini API Key is missing. Set it in the .env file.")

    # Define prompt based on user input
    prompt = f"""
    Generate feedback for the following student submission.
    
    Submission:
    {student_submission}
    
    Preferences:
    - Tone: {feedback_tone}
    - Focus: {feedback_focus}
    - Length: {feedback_length}
    - Auto-Grading: {"Enabled" if include_auto_grading else "Disabled"}

    Provide detailed, constructive feedback.
    """

    headers = {
        "Content-Type": "application/json"
    }

    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": prompt}]}
        ]
    }

    try:
        response = requests.post(f"{API_URL}?key={GEMINI_API_KEY}", json=payload, headers=headers)
        response.raise_for_status()

        result = response.json()
        
        # Extract generated feedback
        feedback = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No feedback generated.")

        return feedback

    except requests.exceptions.RequestException as e:
        raise Exception(f" Error calling Gemini API: {str(e)}")
