from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.feedback_service import generate_feedback

router = APIRouter(prefix="/feedback", tags=["AI Feedback Generator"])

class FeedbackRequest(BaseModel):
    student_submission: str
    feedback_tone: str  # Supportive, Constructive, Critical
    feedback_focus: str  # Comprehensive, etc.
    feedback_length: str  # Short, Standard, Long
    include_auto_grading: bool

@router.post("/generate")
def create_feedback(request: FeedbackRequest):
    """ Generates AI-powered feedback for student submissions. """
    try:
        response = generate_feedback(
            request.student_submission,
            request.feedback_tone,
            request.feedback_focus,
            request.feedback_length,
            request.include_auto_grading
        )
        return {"feedback": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f" Feedback generation failed: {str(e)}")
