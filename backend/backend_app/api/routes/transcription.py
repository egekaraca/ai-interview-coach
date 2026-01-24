# backend/backend_app/api/routes/transcription.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from openai import OpenAI
import os

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Transcribe audio using OpenAI Whisper
    """
    try:
        # Save uploaded file temporarily
        temp_path = f"/tmp/{audio.filename}"
        with open(temp_path, "wb") as f:
            content = await audio.read()
            f.write(content)

        # Transcribe with Whisper
        with open(temp_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="en"
            )

        # Clean up
        os.remove(temp_path)

        return {
            "text": transcript.text,
            "success": True
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))