from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session        
from app.core.db import get_db             
from app.services.ai_service import AIService
from app.schemas import ai_schema
from app.api import deps
from app import models
from datetime import date

router = APIRouter(prefix="/ai", tags=["AI Integration"])
ai_service = AIService()




def calculate_duration(start_date: date, end_date: date = None):
    if not end_date:
        end_date = date.today()
    delta = end_date - start_date
    years = delta.days // 365
    months = (delta.days % 365) // 30
    return f"{years} tahun {months} bulan"
def format_profile_for_ai(user: models.User, profile: models.Profile, educations, experiences, certifications):
    # Ambil data pendidikan terakhir
    last_edu = educations[0] if educations else None
    edu_str = f"Jenjang Pendidikan: {last_edu.level if last_edu else '-'}\nJurusan: {last_edu.major if last_edu else '-'}"
    
    # Ambil data pengalaman terakhir
    last_exp = experiences[0] if experiences else None
    exp_str = f"Posisi Pekerjaan: {last_exp.job_title if last_exp else '-'}\nDeskripsi Tugas: {last_exp.description if last_exp else '-'}\nLama Bekerja: {calculate_duration(last_exp.start_date, last_exp.end_date) if last_exp else '-'}"
    
    # Gabungkan Skills
    skills_str = ", ".join(profile.skills) if profile.skills else "-"
    
    # Gabungkan Sertifikasi
    cert_str = ", ".join([c.name for c in certifications]) if certifications else "-"

    # RANGKAI SESUAI FORMAT TIM 2
    prompt_text = (
        f"Berikut data singkat saya:\n"
        f"{edu_str}\n"
        f"Bidang Pelatihan: -\n" # Kalau ada data pelatihan di DB, masukkan sini
        f"Sertifikasi: {cert_str}\n"
        f"{exp_str}\n"
        f"Keterampilan: {skills_str}"
    )
    return prompt_text


@router.post("/interview/start", response_model=ai_schema.InterviewResponse)
async def start_interview_session(
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    educations = db.query(models.Education).filter(models.Education.profile_id == profile.id).all()
    experiences = db.query(models.Experience).filter(models.Experience.profile_id == profile.id).all()
    certifications = db.query(models.Certification).filter(models.Certification.profile_id == profile.id).all()

    user_data_prompt = format_profile_for_ai(current_user, profile, educations, experiences, certifications)
    
    # 3. Reset Session Lama
    db.query(models.InterviewLog).filter(models.InterviewLog.user_id == current_user.id).delete()
    db.commit()

    system_instruction = {
        "role": "system",
        "content": "Anda adalah interviewer dari platform talenta digital Diploy khusus Area Fungsi. Tugas Anda adalah menggali detail kompetensi talenta berdasarkan data awal yang diberikan, meluruskan jawaban yang kurang relevan, dan memastikan informasi yang terkumpul cukup tajam untuk pemetaan Area Fungsi dan Level Okupasi. Gunakan bahasa Indonesia yang baik dan benar, tetap profesional, dan jangan menggunakan bahasa gaul atau singkatan informal."
    }

    ai_result = await ai_service.get_interview_reply(
        prompt=user_data_prompt,      
        history=[system_instruction]  
    )
    
    new_log = models.InterviewLog(
        user_id=current_user.id,
        user_prompt=user_data_prompt,
        ai_response=ai_result.data.answer
    )
    db.add(new_log)
    db.commit()

    return ai_result

# 2. Talent Mapping 
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