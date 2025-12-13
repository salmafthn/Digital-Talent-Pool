from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session        
from app.core.db import get_db             
from app.services.ai_service import AIService
from app.schemas import ai_schema
from app.api import deps
from app import models
from datetime import date
from typing import List
import re  # <--- Tambahan penting untuk Regex

router = APIRouter(prefix="/ai", tags=["AI Integration"])
ai_service = AIService()

def calculate_duration(start_date: date, end_date: date = None):
    if not start_date:
        return "0 tahun 0 bulan 0 hari"
        
    if not end_date:
        end_date = date.today()
        
    delta = end_date - start_date
    years = delta.days // 365
    months = (delta.days % 365) // 30
    days = (delta.days % 365) % 30
    
    return f"{years} tahun {months} bulan {days} hari"

def format_profile_for_ai(user: models.User, profile: models.Profile, educations, experiences, certifications):
    # 1. PENDIDIKAN
    last_edu = educations[0] if educations else None
    
    jenjang = last_edu.level if (last_edu and last_edu.level) else "-"
    jurusan = last_edu.major if (last_edu and last_edu.major) else "-"
    
    # Judul Tugas Akhir
    if last_edu and last_edu.final_project_title and last_edu.final_project_title.strip() not in ["-", ""]:
        judul_ta = last_edu.final_project_title
    else:
        judul_ta = "Tidak ada tugas akhir"

    # 2. SERTIFIKASI & PELATIHAN
    if certifications:
        cert_names = [c.name for c in certifications if c.name]
        nama_isi = ", ".join(cert_names) if cert_names else ""
        
        cert_fields = [getattr(c, "bidang_keahlian", "") for c in certifications if getattr(c, "bidang_keahlian", None)]
        bidang_isi = ", ".join(cert_fields) if cert_fields else ""
        
        sertifikasi_str = nama_isi if nama_isi else "Belum memiliki sertifikasi"
        bidang_sertifikasi_str = bidang_isi if bidang_isi else "Tidak ada sertifikasi"
        
        nama_pelatihan = nama_isi if nama_isi else "Tidak ada pelatihan"
        bidang_pelatihan = bidang_isi if bidang_isi else "Tidak ada pelatihan"
    else:
        sertifikasi_str = "Belum memiliki sertifikasi"
        bidang_sertifikasi_str = "Tidak ada sertifikasi"
        nama_pelatihan = "Tidak ada pelatihan"
        bidang_pelatihan = "Tidak ada pelatihan"

    # 3. PENGALAMAN KERJA
    last_exp = experiences[0] if experiences else None
    
    if last_exp:
        posisi_pekerjaan = last_exp.position if last_exp.position else "Belum memiliki pengalaman kerja"
        deskripsi_tugas = last_exp.description if last_exp.description else "Belum memiliki pengalaman kerja"
        lama_bekerja = calculate_duration(last_exp.start_date, last_exp.end_date)
    else:
        posisi_pekerjaan = "Belum memiliki pengalaman kerja"
        deskripsi_tugas = "Belum memiliki pengalaman kerja"
        lama_bekerja = "0 tahun 0 bulan 0 hari"

    # 4. KETERAMPILAN
    skills_str = ", ".join(profile.skills) if profile.skills else "-"

    # FORMAT STRING FINAL
    prompt_text = (
        f"Berikut data singkat saya:\n"
        f"Jenjang Pendidikan: {jenjang}\n"
        f"Jurusan: {jurusan}\n"
        f"Judul Tugas Akhir: {judul_ta}\n"
        f"Bidang Pelatihan: {bidang_pelatihan}\n"
        f"Nama Pelatihan: {nama_pelatihan}\n"
        f"Sertifikasi: {sertifikasi_str}\n"
        f"Bidang Sertifikasi: {bidang_sertifikasi_str}\n"
        f"Posisi Pekerjaan: {posisi_pekerjaan}\n"
        f"Deskripsi Tugas dan Tanggung Jawab: {deskripsi_tugas}\n"
        f"Lama Bekerja: {lama_bekerja}\n"
        f"Keterampilan: {skills_str}\n"
    )
    
    return prompt_text

# Fungsi Helper untuk membersihkan tag <think>
def clean_think_tag(text: str) -> str:
    if not text:
        return ""
    # Regex untuk menghapus <think>...</think> termasuk newlines (DOTALL)
    cleaned = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    return cleaned.strip()


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

    # 2. Kirim Data Awal ke AI
    ai_result = await ai_service.get_interview_reply(
        prompt=user_data_prompt,      
        history=[] 
    )
    
    # --- BERSIHKAN RESPONSE SEBELUM DISIMPAN/DIKEMBALIKAN ---
    clean_response = clean_think_tag(ai_result.data.answer)
    ai_result.data.answer = clean_response
    # --------------------------------------------------------
    
    new_log = models.InterviewLog(
        user_id=current_user.id,
        user_prompt=user_data_prompt,
        ai_response=clean_response # Simpan yang sudah bersih
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
    
    # 2. Susun History Murni
    history_payload = []
    for log in past_logs:
        history_payload.append({"role": "user", "content": log.user_prompt})
        history_payload.append({"role": "assistant", "content": log.ai_response})
     
    # 3. Prompt Injection (Breadth First Strategy)
    prompt_for_ai = (
        f"{request.prompt}\n\n"
        "(Instruksi Sistem: Terima kasih atas jawabannya. Sekarang, silakan LIHAT KEMBALI data profil awal kandidat. "
        "Ajukan satu pertanyaan baru untuk memvalidasi aspek profil LAINNYA yang BELUM ditanyakan (misalnya: jika tadi Pendidikan, sekarang tanya Sertifikasi, Pengalaman, atau Skill). "
        "Pastikan pertanyaan relevan dengan informasi yang tertulis di profil kandidat. "
        "Jangan menggali topik yang sama terlalu dalam jika informasi dasar sudah didapat.)"
    )

    # 4. Kirim ke AI
    ai_result = await ai_service.get_interview_reply(prompt_for_ai, history_payload)
    
    # --- BERSIHKAN RESPONSE SEBELUM DISIMPAN/DIKEMBALIKAN ---
    clean_response = clean_think_tag(ai_result.data.answer)
    ai_result.data.answer = clean_response
    # --------------------------------------------------------
    
    # 5. Simpan Chat BARU ke Database
    new_log = models.InterviewLog(
        user_id=current_user.id,
        user_prompt=request.prompt, 
        ai_response=clean_response # Simpan yang sudah bersih
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
    
    # FILTER: Hapus log pertama jika itu adalah prompt profil otomatis
    cleaned_logs = []
    for log in logs:
        if log.user_prompt.startswith("Berikut data singkat saya"):
            # Kosongkan user_prompt agar Frontend menyembunyikannya
            log.user_prompt = "" 
            cleaned_logs.append(log)
        else:
            cleaned_logs.append(log)
            
    return cleaned_logs

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
        # Bersihkan juga di sini untuk jaga-jaga
        full_text = " ".join([
            f"User berkata: {log.user_prompt}. AI menjawab: {clean_think_tag(log.ai_response)}." 
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