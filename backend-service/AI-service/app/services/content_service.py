import requests
import os
from dotenv import load_dotenv

# Load API Key from .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"

def generate_content(topic_name, content_type):
    """ Calls Gemini AI to generate learning content """

    if not GEMINI_API_KEY:
        raise ValueError(" Gemini API Key is missing. Set it in the .env file.")

    # Define prompt based on content type
    prompt = f"""
    Generate educational content for the topic: {topic_name}
    Content Type: {content_type}
    
    Options:
    - Summary: Provide a concise summary of the topic.
    - Detailed Notes: Generate detailed notes covering all aspects.
    - Flashcards: Provide at least 5 flashcard-style Q&A.
    - Concept Map: Describe key concepts and how they relate.
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
        
        # Extract generated content
        content = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No content generated.")

        return content

    except requests.exceptions.RequestException as e:
        raise Exception(f" Error calling Gemini API: {str(e)}")
