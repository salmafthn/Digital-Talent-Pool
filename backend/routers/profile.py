from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from schemas import profile_schema
from services.profile_service import ProfileService
from dependencies import get_current_user
import models
import shutil
import os
import uuid
from datetime import date

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)

service = ProfileService()

# --- ENDPOINT UTAMA ---

@router.get("/", response_model=profile_schema.ProfileFullResponse)
def get_my_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Inject email dari tabel User ke response Profile
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

# --- SUB-MODULE: CERTIFICATION ---

@router.post("/certification", response_model=profile_schema.CertificationResponse)
async def add_certification(    
    name: str = Form(..., min_length=3),
    organizer: str = Form(..., min_length=3),
    year: int = Form(...),
    description: str = Form(..., min_length=5),
    file: UploadFile = File(...), # Wajib Upload File
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
): 

    current_year = date.today().year
    if not (current_year - 5 <= year <= current_year + 5):
        raise HTTPException(
            status_code=400, 
            detail=f"Tahun sertifikasi harus antara {current_year - 5} dan {current_year + 5}"
        )
 
    allowed_types = ["image/jpeg", "image/png", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Format file harus JPG, PNG, atau PDF")
 
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/certifications/{unique_filename}"
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal upload file: {str(e)}")
 
    file_url = f"/static/certifications/{unique_filename}"
 
    cert_data = profile_schema.CertificationCreate(
        name=name,
        organizer=organizer,
        year=year,
        description=description,
        proof_url=file_url
    )

    return service.add_certification(db, current_user.id, cert_data)

@router.delete("/certification/{cert_id}")
def delete_certification(
    cert_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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