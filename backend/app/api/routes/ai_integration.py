from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session        
from app.core.db import get_db             
from app.services.ai_service import AIService
from app.schemas import ai_schema
from app.api import deps
from app import models
from datetime import date
from typing import List

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
    last_edu = educations[0] if educations else None
    edu_str = f"Jenjang Pendidikan: {last_edu.level if last_edu else '-'}\nJurusan: {last_edu.major if last_edu else '-'}"
    
    last_exp = experiences[0] if experiences else None
    exp_str = f"Posisi Pekerjaan: {last_exp.job_title if last_exp else '-'}\nDeskripsi Tugas: {last_exp.description if last_exp else '-'}\nLama Bekerja: {calculate_duration(last_exp.start_date, last_exp.end_date) if last_exp else '-'}"
    
    skills_str = ", ".join(profile.skills) if profile.skills else "-"
    cert_str = ", ".join([c.name for c in certifications]) if certifications else "-"
 
    # Prompt Awal: Data User
    prompt_text = (
        f"Berikut data singkat saya:\n"
        f"{edu_str}\n"
        f"Bidang Pelatihan: -\n"
        f"Sertifikasi: {cert_str}\n"
        f"{exp_str}\n"
        f"Keterampilan: {skills_str}\n\n"
        f"[INSTRUKSI AWAL]: Sebagai Interviewer, tugasmu adalah memvalidasi data di atas. "
        f"Jangan berikan rangkuman. Langsung ajukan 1 pertanyaan pembuka untuk memverifikasi salah satu poin data."
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
    
    # 1. Reset Session Lama
    db.query(models.InterviewLog).filter(models.InterviewLog.user_id == current_user.id).delete()
    db.commit()

    # 2. Start Interview (Logic Hybrid Tim 3 / Tim 5)
    # Service akan handle start session (untuk Tim 5) atau return prompt awal (untuk Tim 3)
    result_dict = await ai_service.start_interview(user_data_prompt)
    
    ai_response_text = result_dict["answer"]
    session_id = result_dict.get("session_id") # Bisa None kalau pakai Tim 3

    # Simpan Session ID (Jika pakai Tim 5)
    if session_id:
        profile.ai_session_id = session_id
        db.add(profile)
        
    new_log = models.InterviewLog(
        user_id=current_user.id,
        user_prompt=user_data_prompt,
        ai_response=ai_response_text
    )
    db.add(new_log)
    db.commit()

    return ai_schema.InterviewResponse(
        success=True,
        message="Session started",
        data={"answer": ai_response_text}
    )


@router.post("/interview", response_model=ai_schema.InterviewResponse)
async def chat_interview(
    request: ai_schema.InterviewRequest,
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Ambil Profile untuk cek Session ID (Support Tim 5)
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    session_id = profile.ai_session_id if profile else None

    # 2. Ambil History Chat (Support Tim 3)
    past_logs = db.query(models.InterviewLog).filter(
        models.InterviewLog.user_id == current_user.id
    ).order_by(models.InterviewLog.created_at.asc()).all()
    
    # 3. Susun History & System Prompt
    history_payload = []
    
    # System Prompt: Instruksi Utama agar AI tahu kapan harus berhenti
    history_payload.append({
        "role": "system",
        "content": (
            "Anda adalah interviewer profesional dari platform talenta digital Diploy. "
            "Tugas Anda: Menggali kompetensi user secara mendalam namun efisien. "
            "ATURAN PENTING: "
            "1. Ajukan pertanyaan satu per satu. "
            "2. Jika Anda menilai informasi sudah CUKUP untuk menentukan Area Fungsi dan Level (1-5), "
            "   SEGERA akhiri sesi dengan ucapan terima kasih dan output format wajib: "
            "   [END OF CHAT] <RESULT>{\"area_fungsi\":\"Nama Area\", \"level\":Angka}</RESULT>. "
            "3. Jangan bertele-tele."
        )
    }) 

    for log in past_logs:
        history_payload.append({"role": "user", "content": log.user_prompt})
        history_payload.append({"role": "assistant", "content": log.ai_response})
     
    # 4. Tambahkan Instruksi 'Hidden' di setiap prompt user agar AI tetap fokus
    # Kita tidak lagi membatasi jumlah chat, tapi mengingatkan AI untuk cek kecukupan data.
    prompt_for_ai = (
        f"{request.prompt}\n\n"
        "(Instruksi Sistem: Respon jawaban user, lalu ajukan pertanyaan selanjutnya. "
        "Namun, jika data dirasa sudah cukup valid untuk penilaian, silakan akhiri dengan tag <RESULT>.)"
    )

    # 5. Kirim ke AI Service
    ai_result = await ai_service.get_interview_reply(
        prompt=prompt_for_ai, 
        history=history_payload,
        session_id=session_id
    )
    
    # 6. Simpan Chat BARU ke Database (Simpan prompt asli user)
    new_log = models.InterviewLog(
        user_id=current_user.id,
        user_prompt=request.prompt, 
        ai_response=ai_result.data.answer
    )
    db.add(new_log)
    db.commit()
    
    return ai_result

@router.get("/history", response_model=List[ai_schema.ChatLogResponse])
def get_chat_history(
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(models.InterviewLog).filter(
        models.InterviewLog.user_id == current_user.id
    ).order_by(models.InterviewLog.created_at.asc()).all()
    
    return logs

# 2. Talent Mapping (Tetap Sama)
@router.post("/mapping", response_model=ai_schema.MappingResponse)
async def talent_mapping(
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(models.InterviewLog).filter(
        models.InterviewLog.user_id == current_user.id
    ).order_by(models.InterviewLog.created_at.asc()).all()
    
    if not logs:
        full_text = "User belum melakukan interview."
    else:
        full_text = " ".join([
            f"User berkata: {log.user_prompt}. AI menjawab: {log.ai_response}." 
            for log in logs
        ])

    result = await ai_service.analyze_talent_mapping(full_text)
    return result
 
@router.post("/questions", response_model=ai_schema.QuestionResponse)
async def generate_questions(
    request: ai_schema.QuestionRequest,
    current_user: models.User = Depends(deps.get_current_user)
):
    return await ai_service.generate_questions(request.area_fungsi, request.level_kompetensi)