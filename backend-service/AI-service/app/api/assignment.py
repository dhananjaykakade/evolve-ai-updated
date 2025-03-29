from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.services.assignment_service import generate_assignment_pdf
from pydantic import BaseModel

router = APIRouter(prefix="/assignment", tags=["Assignment"])

class AssignmentRequest(BaseModel):
    subject: str
    assignment_type: str
    word_limit: int
    deadline: str
    topic: str  # Added 'topic' field

@router.post("/generate", response_class=FileResponse)
def create_assignment(request: AssignmentRequest):
    try:
        pdf_filename = generate_assignment_pdf(
            request.subject, request.assignment_type, request.word_limit, request.deadline, request.topic
        )
        
        return FileResponse(pdf_filename, filename="assignment.pdf", media_type="application/pdf")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f" Assignment generation failed: {str(e)}")
