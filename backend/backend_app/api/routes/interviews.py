"""
API routes for managing interview sessions
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from backend_app.database.database import get_db
from backend_app.database.models import InterviewSession, InterviewAnswer

router = APIRouter()

# Pydantic models for request/response
class InterviewSessionCreate(BaseModel):
    interview_type: str = "general"
    job_role: Optional[str] = None
    job_description: Optional[str] = None

class InterviewSessionResponse(BaseModel):
    id: int
    created_at: datetime
    interview_type: str
    job_role: Optional[str]
    overall_score: float
    is_completed: bool
    
    class Config:
        from_attributes = True

class AnswerSubmit(BaseModel):
    session_id: int
    question_id: int
    transcription: str
    duration: int

@router.post("/start", response_model=InterviewSessionResponse)
async def start_interview(
    session_data: InterviewSessionCreate,
    db: Session = Depends(get_db)
):
    """
    Start a new interview session
    """
    new_session = InterviewSession(
        interview_type=session_data.interview_type,
        job_role=session_data.job_role,
        job_description=session_data.job_description,
        is_completed=False
    )
    
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    return new_session

@router.get("/{session_id}", response_model=InterviewSessionResponse)
async def get_interview(session_id: int, db: Session = Depends(get_db)):
    """
    Get interview session details
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    return session

@router.get("/", response_model=List[InterviewSessionResponse])
async def list_interviews(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    List all interview sessions
    """
    sessions = db.query(InterviewSession)\
        .filter(InterviewSession.is_deleted == False)\
        .order_by(InterviewSession.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return sessions

@router.post("/{session_id}/complete")
async def complete_interview(session_id: int, db: Session = Depends(get_db)):
    """
    Mark interview session as completed
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    session.is_completed = True
    db.commit()
    
    return {"message": "Interview completed", "session_id": session_id}

@router.post("/{session_id}/upload-video")
async def upload_video(
    session_id: int,
    video: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload recorded interview video
    """
    import os
    import shutil
    
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    # Save video file
    video_dir = "../data/videos"
    os.makedirs(video_dir, exist_ok=True)
    
    video_filename = f"session_{session_id}_{video.filename}"
    video_path = os.path.join(video_dir, video_filename)
    
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)
    
    # Update session with video path
    session.video_path = video_path
    db.commit()
    
    return {
        "message": "Video uploaded successfully",
        "video_path": video_path
    }

@router.delete("/{session_id}")
async def delete_interview(session_id: int, db: Session = Depends(get_db)):
    """
    Soft delete an interview session
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    session.is_deleted = True
    db.commit()
    
    return {"message": "Interview deleted", "session_id": session_id}
