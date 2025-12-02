from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any

from app import crud, schemas, models
from app.api import deps
from app.core import security
from app.core.db import get_db  # Ambil dari core/db.py
from app import models


router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    # 1. Cari user di DB
    user = crud.get_user_by_email(db, email=form_data.username)
    
    # 2. Validasi Password
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Email atau password salah")
    
    # 3. Bikin Token
    access_token = security.create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register")
def register(user_in: schemas.UserCreate, db: Session = Depends(deps.get_db)):
    # 1. Cek Email Duplikat
    if crud.get_user_by_email(db, email=user_in.email):
        raise HTTPException(
            status_code=400, 
            detail="Email sudah terdaftar. Gunakan email lain."
        )
    user_by_username = db.query(models.User).filter(models.User.username == user_in.username).first()
    if user_by_username:
        raise HTTPException(
            status_code=400, 
            detail="Username sudah dipakai. Silakan pilih username lain."
        )
 
    profile_by_nik = db.query(models.Profile).filter(models.Profile.nik == user_in.nik).first()
    if profile_by_nik:
        raise HTTPException(
            status_code=400, 
            detail="NIK sudah terdaftar dalam sistem."
        ) 
    try:
        crud.create_user(db, user_in)
    except Exception as e:
        # Jaga-jaga kalau ada error database lain
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal mendaftar: {str(e)}")
    
    return {"message": "User created successfully"}