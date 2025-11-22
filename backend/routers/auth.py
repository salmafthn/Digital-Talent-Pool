from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from database import get_db
from schemas import auth_schema
from services.auth_service import AuthService
import models

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

auth_service = AuthService()

@router.post("/register")
def register(user: auth_schema.UserCreate, db: Session = Depends(get_db)):
    # 1. Cek duplikat (opsional, karena di service biasanya dicek lagi, tapi gapapa biar cepat)
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Panggil Service (Service akan simpan User DAN Profile sekaligus)
    auth_service.create_user(db, user)
    
    # 3. Selesai! Jangan bikin profile lagi disini.
    return {"message": "User created successfully"}

@router.post("/login", response_model=auth_schema.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user_login = auth_schema.UserLogin(email=form_data.username, password=form_data.password)
    
    user = auth_service.authenticate_user(db, user_login)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = auth_service.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}