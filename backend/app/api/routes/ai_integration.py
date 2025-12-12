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

# --- KONFIGURASI BATAS CHAT ---
MAX_CHAT_TURNS = 5  # Maksimal 5 kali tanya jawab

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
        f"Jangan berikan rangkuman. Langsung ajukan 1 pertanyaan pembuka untuk memverifikasi salah satu poin data (misal Pendidikan atau Pengalaman)."
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
    
    # 1. Reset Session Lama (Hapus chat sebelumnya agar mulai dari 0)
    db.query(models.InterviewLog).filter(models.InterviewLog.user_id == current_user.id).delete()
    db.commit()

    # 2. System Prompt Awal
    system_instruction = {
        "role": "system",
        "content": (
            "Anda adalah interviewer profesional dari platform talenta digital Diploy. "
            "Tugas Anda: Menggali kompetensi user berdasarkan data profil yang diberikan. "
            "Gaya Bicara: Profesional, sopan, Bahasa Indonesia baku, to the point. "
            "PENTING: Jangan bertanya hal yang sama berulang kali. "
            "Setiap pertanyaan harus menggali aspek BERBEDA (misal: jika sudah tanya Pendidikan, tanya Sertifikasi, lalu tanya Skill)."
        )
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


@router.post("/interview", response_model=ai_schema.InterviewResponse)
async def chat_interview(
    request: ai_schema.InterviewRequest,
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Ambil History Chat Sebelumnya
    past_logs = db.query(models.InterviewLog).filter(
        models.InterviewLog.user_id == current_user.id
    ).order_by(models.InterviewLog.created_at.asc()).all()
    
    # 2. Hitung jumlah giliran chat saat ini
    current_turn = len(past_logs) # Jumlah chat yang sudah terjadi
    remaining_turns = MAX_CHAT_TURNS - current_turn
    
    # 3. Tentukan Strategi Prompt Berdasarkan Giliran (Turn)
    
    if remaining_turns <= 0:
        # --- MODE FINAL (Force Closing) ---
        instruction_add_on = (
            "\n\n[INSTRUKSI SISTEM - PENTING!]: "
            "Ini adalah akhir sesi interview. JANGAN BERTANYA LAGI. "
            "Tugasmu sekarang: "
            "1. Berikan ucapan terima kasih singkat. "
            "2. Berikan penilaian Area Fungsi dan Level (1-5) berdasarkan seluruh percakapan. "
            "3. WAJIB akhiri respons dengan format persis seperti ini: "
            "[END OF CHAT] ...ringkasan... <RESULT>{\"area_fungsi\":\"Nama Area\", \"level\":Angka}</RESULT>"
        )
    else:
        # --- MODE PROBING (Cari Topik Lain) ---
        instruction_add_on = (
            f"\n\n[INSTRUKSI SISTEM - Sisa Pertanyaan: {remaining_turns}]: "
            "1. Berikan respon singkat atas jawaban user. "
            "2. LIHAT DATA PROFIL AWAL user. "
            "3. AJUKAN 1 PERTANYAAN BARU tentang aspek profil yang BELUM dibahas. "
            "   - Jika sebelumnya membahas Pendidikan, sekarang tanya tentang Sertifikasi atau Pengalaman Kerja atau Skill. "
            "   - JANGAN menggali topik yang sama terus menerus (jangan deep-dive). "
            "   - Pindah topik agar semua data profil terverifikasi. "
            "4. Jangan gunakan label 'Respons:' atau 'Pertanyaan:'."
        )

    # 4. Susun History
    history_payload = []
    
    # System Prompt Dasar (Selalu diingatkan)
    history_payload.append({
        "role": "system",
        "content": "Anda adalah interviewer. Fokus: Validasi breadth (keluasan) kompetensi user, bukan cuma kedalaman satu topik."
    }) 

    for log in past_logs:
        history_payload.append({"role": "user", "content": log.user_prompt})
        history_payload.append({"role": "assistant", "content": log.ai_response})
     
    # 5. Gabungkan Prompt User + Instruksi Rahasia (Injection)
    prompt_for_ai = f"{request.prompt}{instruction_add_on}"

    # 6. Kirim ke AI
    ai_result = await ai_service.get_interview_reply(prompt_for_ai, history_payload)
    
    # 7. Simpan Chat BARU ke Database (Simpan prompt asli user, tanpa instruksi rahasia)
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