from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.content_service import generate_content

router = APIRouter(prefix="/content", tags=["Content Generator"])

class ContentRequest(BaseModel):
    topic_name: str
    content_type: str

@router.post("/generate")
def create_content(request: ContentRequest):
    """ Generates learning content based on user input. """
    try:
        response = generate_content(request.topic_name, request.content_type)
        return {"content": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f" Content generation failed: {str(e)}")
