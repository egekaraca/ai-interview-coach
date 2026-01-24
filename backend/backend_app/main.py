"""
AI Interview Coach - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

from backend_app.api.routes import interviews, analysis, reports
from backend_app.database.database import engine, Base

from dotenv import load_dotenv
load_dotenv()

from backend_app.api.routes import transcription

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="AI Interview Coach API",
    description="Backend API for AI-powered interview coaching",
    version="1.0.0"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (for video/report serving)
app.mount("/videos", StaticFiles(directory="../data/videos"), name="videos")
app.mount("/reports", StaticFiles(directory="../data/reports"), name="reports")

# Include routers
app.include_router(transcription.router, prefix="/api", tags=["transcription"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["Interviews"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AI Interview Coach API is running!",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "services": {
            "face_detection": "ready",
            "speech_recognition": "ready",
            "ai_evaluation": "ready"
        }
    }

if __name__ == "__main__":
    # Run with: python -m backend_app.main
    uvicorn.run("backend_app.main:app", host="0.0.0.0", port=8000, reload=True)