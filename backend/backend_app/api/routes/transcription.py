from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from faster_whisper import WhisperModel
import os
import tempfile
import shutil

router = APIRouter()

# Modeli yükle (Global)
print("Loading Local Whisper Model...")
model = WhisperModel("base", device="cpu", compute_type="int8")
print("Local Whisper Model Loaded!")


@router.post("/transcribe")
async def transcribe_audio(
        audio: UploadFile = File(...),
        prompt: str = Form(default="")  # Frontend'den gelen önceki metin (ipucu)
):
    temp_file_path = None
    try:
        # Geçici dosya oluştur
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_file:
            shutil.copyfileobj(audio.file, tmp_file)
            temp_file_path = tmp_file.name

        # Transkript oluştur (initial_prompt ile bağlamı koru)
        # initial_prompt: Modelin cümleyi önceki cümlenin devamı gibi algılamasını sağlar.
        segments, info = model.transcribe(
            temp_file_path,
            beam_size=5,
            initial_prompt=prompt
        )

        full_text = " ".join([segment.text for segment in segments])

        return {
            "text": full_text.strip(),
            "success": True,
            "language": info.language
        }

    except Exception as e:
        print(f"Hata: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)