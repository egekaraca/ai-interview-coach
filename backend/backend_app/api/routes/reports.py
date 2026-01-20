"""
API routes for generating and retrieving reports
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from backend_app.database.database import get_db
from backend_app.database.models import InterviewSession

router = APIRouter()

class ReportResponse(BaseModel):
    session_id: int
    overall_score: float
    strengths: List[str]
    areas_for_improvement: List[str]
    ai_feedback: str

@router.get("/{session_id}", response_model=ReportResponse)
async def get_report(session_id: int, db: Session = Depends(get_db)):
    """
    Get detailed report for an interview session
    """
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return ReportResponse(
        session_id=session.id,
        overall_score=session.overall_score,
        strengths=session.strengths or [],
        areas_for_improvement=session.areas_for_improvement or [],
        ai_feedback=session.ai_feedback or "Analysis pending..."
    )

@router.get("/{session_id}/pdf")
async def download_report_pdf(session_id: int, db: Session = Depends(get_db)):
    """
    Download report as PDF
    """
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # TODO: Generate PDF report
    # For now, return placeholder
    
    raise HTTPException(status_code=501, detail="PDF generation not yet implemented")

@router.get("/progress/summary")
async def get_progress_summary(db: Session = Depends(get_db)):
    """
    Get overall progress summary across all sessions
    """
    sessions = db.query(InterviewSession)\
        .filter(InterviewSession.is_completed == True)\
        .filter(InterviewSession.is_deleted == False)\
        .all()
    
    if not sessions:
        return {
            "total_sessions": 0,
            "average_score": 0.0,
            "improvement": 0.0
        }
    
    total_sessions = len(sessions)
    average_score = sum(s.overall_score for s in sessions) / total_sessions
    
    first_score = sessions[-1].overall_score if sessions else 0
    latest_score = sessions[0].overall_score if sessions else 0
    improvement = latest_score - first_score
    
    return {
        "total_sessions": total_sessions,
        "average_score": round(average_score, 2),
        "improvement": round(improvement, 2),
        "latest_score": round(latest_score, 2)
    }
