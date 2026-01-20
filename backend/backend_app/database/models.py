"""
Database models for AI Interview Coach
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, JSON
from sqlalchemy.sql import func
from backend_app.database.database import Base

class InterviewSession(Base):
    """
    Stores information about each interview session
    """
    __tablename__ = "interview_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Interview metadata
    interview_type = Column(String, default="general")  # behavioral, technical, general
    job_role = Column(String, nullable=True)  # Target job role
    job_description = Column(Text, nullable=True)  # Optional job description
    
    # Video information
    video_path = Column(String, nullable=True)  # Path to recorded video
    duration = Column(Integer, default=0)  # Duration in seconds
    
    # Overall scores (0-100)
    overall_score = Column(Float, default=0.0)
    eye_contact_score = Column(Float, default=0.0)
    posture_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    answer_quality_score = Column(Float, default=0.0)
    
    # Speech metrics
    filler_word_count = Column(Integer, default=0)
    speaking_pace = Column(Float, default=0.0)  # Words per minute
    total_words = Column(Integer, default=0)
    
    # AI feedback
    ai_feedback = Column(Text, nullable=True)  # Claude's overall feedback
    strengths = Column(JSON, nullable=True)  # List of strengths
    areas_for_improvement = Column(JSON, nullable=True)  # List of improvements
    
    # Session status
    is_completed = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)  # Soft delete for old videos


class Question(Base):
    """
    Interview questions database
    """
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Question details
    question_text = Column(Text, nullable=False)
    question_type = Column(String, default="behavioral")  # behavioral, technical, situational
    difficulty = Column(String, default="medium")  # easy, medium, hard
    category = Column(String, nullable=True)  # leadership, problem-solving, etc.
    
    # For software engineering interviews
    is_technical = Column(Boolean, default=False)
    tech_stack = Column(JSON, nullable=True)  # ["python", "react", etc.]
    
    # Metadata
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InterviewAnswer(Base):
    """
    Individual answers within an interview session
    """
    __tablename__ = "interview_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, nullable=False)  # Foreign key to InterviewSession
    question_id = Column(Integer, nullable=False)  # Foreign key to Question
    
    # Answer content
    transcription = Column(Text, nullable=True)  # Speech-to-text output
    duration = Column(Integer, default=0)  # Answer duration in seconds
    
    # Metrics for this specific answer
    eye_contact_percentage = Column(Float, default=0.0)
    posture_score = Column(Float, default=0.0)
    filler_words = Column(Integer, default=0)
    word_count = Column(Integer, default=0)
    
    # AI evaluation
    answer_score = Column(Float, default=0.0)  # 0-10 score
    follows_star_format = Column(Boolean, default=False)
    ai_feedback = Column(Text, nullable=True)
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)


class UserProgress(Base):
    """
    Track user progress over time
    """
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, default="default")  # For future multi-user support
    
    # Progress metrics
    total_sessions = Column(Integer, default=0)
    total_questions_answered = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    
    # Improvement tracking
    first_session_score = Column(Float, nullable=True)
    latest_session_score = Column(Float, nullable=True)
    improvement_percentage = Column(Float, default=0.0)
    
    # Timestamps
    last_practice_date = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
