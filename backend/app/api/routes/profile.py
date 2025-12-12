from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.schemas import profile_schema  
from app.services.profile_service import ProfileService
from app.api.deps import get_current_user
from app import models
from app.core.storage import minio_client, bucket_name # Import MinIO Client
import uuid
import os
import io # Untuk handle file stream
from datetime import date
from app.schemas.profile_schema import (
    EducationLevelEnum, 
    GenderEnum, 
    JobTypeEnum, 
    FunctionalAreaEnum,
    SKILL_OPTIONS
)

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)

service = ProfileService()

# --- ENDPOINT UTAMA (GET & UPDATE PROFILE) ---

@router.get("/", response_model=profile_schema.ProfileFullResponse)
def get_my_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = service.get_profile_by_user_id(db, current_user.id)
    profile.email = current_user.email 
    return profile

@router.put("/", response_model=profile_schema.ProfileFullResponse)
def update_my_profile(
    data: profile_schema.ProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return service.update_profile(db, current_user.id, data)

# --- CONSTANTS & COMPLETENESS ---

@router.get("/constants")
def get_all_constants():
    from app.schemas.profile_schema import EducationLevelEnum, GenderEnum, JobTypeEnum, FunctionalAreaEnum
    return {
        "genders": [e.value for e in GenderEnum],
        "education_levels": [e.value for e in EducationLevelEnum],
        "job_types": [e.value for e in JobTypeEnum],
        "functional_areas": [e.value for e in FunctionalAreaEnum],
        "skills": SKILL_OPTIONS
    }

@router.get("/completeness")
def get_profile_completeness(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = service.get_profile_by_user_id(db, current_user.id)
    score = 0
    missing_fields = []

    if profile.phone and profile.address and profile.bio:
        score += 25
    else:
        missing_fields.append("Lengkapi No HP, Alamat, dan Bio")

    if profile.avatar_url:
        score += 15
    else:
        missing_fields.append("Upload Foto Profil")

    if profile.educations:
        score += 30
    else:
        missing_fields.append("Tambahkan minimal 1 Riwayat Pendidikan")

    if profile.experiences or profile.certifications:
        score += 30
    else:
        missing_fields.append("Tambahkan minimal 1 Pengalaman Kerja atau Sertifikasi")

    is_ready_for_assessment = score >= 80

    return {
        "percentage": score,
        "is_ready_for_assessment": is_ready_for_assessment,
        "missing_items": missing_fields
    }

# --- SUB-MODULE: EDUCATION ---

@router.post("/education", response_model=profile_schema.EducationResponse)
def add_education(
    data: profile_schema.EducationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return service.add_education(db, current_user.id, data)

@router.delete("/education/{edu_id}")
def delete_education(
    edu_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return service.delete_education(db, current_user.id, edu_id)

# --- SUB-MODULE: CERTIFICATION (MINIO UPDATED) ---

@router.post("/certification", response_model=profile_schema.CertificationResponse)
async def add_certification(
    name: str = Form(..., min_length=3),
    organizer: str = Form(..., min_length=3),
    year: int = Form(...),
    description: str = Form(..., min_length=5),
    bidang_keahlian: str = Form(...),
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Validasi Tahun
    current_year = date.today().year
    if not (current_year - 5 <= year <= current_year + 5):
        raise HTTPException(
            status_code=400, 
            detail=f"Tahun sertifikasi harus antara {current_year - 5} dan {current_year + 5}"
        )

    # 2. Validasi Tipe File
    allowed_types = ["image/jpeg", "image/png", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Format file harus JPG, PNG, atau PDF")

    # 3. Upload ke MinIO
    try:
        # Baca file ke memori
        file_content = await file.read()
        file_stream = io.BytesIO(file_content)
        file_size = len(file_content)
        
        file_extension = file.filename.split(".")[-1]
        # Path: certifications/USER_ID_UUID.pdf
        object_name = f"certifications/{current_user.id}_{uuid.uuid4()}.{file_extension}"

        # Upload
        minio_client.put_object(
            bucket_name,
            object_name,
            file_stream,
            length=file_size,
            content_type=file.content_type
        )

        # Generate URL Publik
        endpoint = os.getenv("MINIO_ENDPOINT")
        # Format: http://IP_VPS:PORT/bucket/certifications/file.pdf
        file_url = f"http://{endpoint}/{bucket_name}/{object_name}"

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal upload MinIO: {str(e)}")

    # 4. Simpan Data ke Database
    cert_data = profile_schema.CertificationCreate(
        name=name,
        organizer=organizer,
        year=year,
        description=description,
        bidang_keahlian=bidang_keahlian,
        proof_url=file_url
    )

    return service.add_certification(db, current_user.id, cert_data)

@router.delete("/certification/{cert_id}")
def delete_certification(
    cert_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ambil data sertifikat dulu untuk dapat URL file
    cert = service.get_certification(db, current_user.id, cert_id)
    
    # Hapus File di MinIO jika ada URL-nya
    if cert.proof_url:
        try:
            object_name = cert.proof_url.split(f"/{bucket_name}/")[-1]
            
            minio_client.remove_object(bucket_name, object_name)
        except Exception as e:
            print(f"Warning: Gagal menghapus file fisik di MinIO: {e}")

    return service.delete_certification(db, current_user.id, cert_id)

# --- SUB-MODULE: EXPERIENCE ---

@router.post("/experience", response_model=profile_schema.ExperienceResponse)
def add_experience(
    data: profile_schema.ExperienceCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return service.add_experience(db, current_user.id, data)

@router.delete("/experience/{exp_id}")
def delete_experience(
    exp_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return service.delete_experience(db, current_user.id, exp_id)

# --- SUB-MODULE: AVATAR (MINIO UPDATED) ---

@router.post("/avatar", response_model=profile_schema.ProfileFullResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Validasi Tipe File
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Format file harus JPG, PNG, atau WebP")

    # 2. Upload ke MinIO
    try:
        file_content = await file.read()
        file_stream = io.BytesIO(file_content)
        file_size = len(file_content)
        
        file_extension = file.filename.split(".")[-1]
        # Path: avatars/USER_ID_UUID.jpg
        object_name = f"avatars/{current_user.id}_{uuid.uuid4()}.{file_extension}"

        minio_client.put_object(
            bucket_name,
            object_name,
            file_stream,
            length=file_size,
            content_type=file.content_type
        )

        endpoint = os.getenv("MINIO_ENDPOINT")
        file_url = f"http://{endpoint}/{bucket_name}/{object_name}"

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal upload MinIO: {str(e)}")

    # 3. Update Database
    update_data = profile_schema.ProfileUpdate(avatar_url=file_url)
    return service.update_profile(db, current_user.id, update_data)

@router.delete("/avatar", response_model=profile_schema.ProfileFullResponse)
def delete_avatar(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = service.get_profile_by_user_id(db, current_user.id)
    
    # Hapus File di MinIO
    if profile.avatar_url:
        try:
            # URL: http://IP:PORT/bucket_name/avatars/filename.jpg
            object_name = profile.avatar_url.split(f"/{bucket_name}/")[-1]
            minio_client.remove_object(bucket_name, object_name)
        except Exception as e:
            print(f"Warning: Gagal menghapus avatar di MinIO: {e}")
    
    # Hapus Link di Database
    return service.remove_avatar(db, current_user.id)