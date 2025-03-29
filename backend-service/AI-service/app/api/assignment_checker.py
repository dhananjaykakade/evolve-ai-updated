from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.as_service import check_assignment
import logging

router = APIRouter(prefix="/assignment", tags=["Assignment Checker"])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/check")
async def check_assignment_api(
    out_of_marks: int = Form(...),
    check_prompt: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Uploads an assignment (PDF) and checks it using Gemini AI.
    """
    if file.content_type != "application/pdf":
        logger.error("Invalid file type: %s", file.content_type)
        raise HTTPException(status_code=400, detail=" Only PDF files are allowed.")
    
    try:
        logger.info("Processing assignment check for file: %s", file.filename)
        response = await check_assignment(file, out_of_marks, check_prompt)
        logger.info("Assignment check completed successfully.")
        return {"status": "success", "data": response}
    except Exception as e:
        logger.error("Assignment checking failed: %s", str(e))
        raise HTTPException(status_code=500, detail=f" Assignment checking failed: {str(e)}")
