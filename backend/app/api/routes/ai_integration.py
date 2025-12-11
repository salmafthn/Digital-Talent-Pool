from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session          # <--- Tambah ini
from app.core.db import get_db              # <--- Tambah ini
from app.services.ai_service import AIService
from app.schemas import ai_schema
from app.api import deps
from app import models

router = APIRouter(prefix="/ai", tags=["AI Integration"])
ai_service = AIService()

# 1. Chat Interview (UPDATE: SIMPAN KE DB)
@router.post("/interview", response_model=ai_schema.InterviewResponse)
async def chat_interview(
    request: ai_schema.InterviewRequest,
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)           # <--- Tambah ini
):
    # 1. Dapatkan jawaban dari AI Tim 3
    ai_result = await ai_service.get_interview_reply(request.prompt)
    
    # 2. Simpan percakapan ke Database
    new_log = models.InterviewLog(
        user_id=current_user.id,
        user_prompt=request.prompt,
        ai_response=ai_result.data.answer  # Ambil teks jawaban AI
    )
    db.add(new_log)
    db.commit()
    
    return ai_result
# 2. Talent Mapping (UPDATE: OTOMATIS AMBIL DARI DB)
@router.post("/mapping", response_model=ai_schema.MappingResponse)
async def talent_mapping(
    # request: ai_schema.MappingRequest, <--- Kita bisa abaikan input frontend
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Ambil semua riwayat chat user ini dari Database
    logs = db.query(models.InterviewLog).filter(
        models.InterviewLog.user_id == current_user.id
    ).order_by(models.InterviewLog.created_at.asc()).all()
    
    if not logs:
        # Kalau belum pernah chat, kirim pesan kosong atau error
        full_text = "User belum melakukan interview."
    else:
        # 2. Gabungkan (Concat) jadi satu string panjang
        # Format: "User: ... AI: ... User: ... AI: ..."
        full_text = " ".join([
            f"User berkata: {log.user_prompt}. AI menjawab: {log.ai_response}." 
            for log in logs
        ])

    # 3. Kirim String Raksasa itu ke AI Mapping
    result = await ai_service.analyze_talent_mapping(full_text)
    
    # (Opsional) Simpan hasil mapping ke tabel Profile atau tabel baru
    
    return result
 
@router.post("/questions", response_model=ai_schema.QuestionResponse)
async def generate_questions(
    request: ai_schema.QuestionRequest,
    current_user: models.User = Depends(deps.get_current_user)
):
    return await ai_service.generate_questions(request.area_fungsi, request.level_kompetensi)