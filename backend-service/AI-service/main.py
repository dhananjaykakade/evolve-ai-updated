from fastapi import FastAPI
from app.api.assignment import router as assignment_router
from app.api.content import router as content_router
from app.api.feedback import router as feedback_router  # Fix: Remove `.router`
from app.api.assignment_checker import router as assignment_routers


app = FastAPI(title="AI Assignment Generator")

# Include API Router
app.include_router(assignment_router)
app.include_router(content_router)
app.include_router(feedback_router)  # Fix applied
app.include_router(assignment_routers)

@app.get("/")
def home():
    return {"message": "AI Assignment Generator is running!"}
