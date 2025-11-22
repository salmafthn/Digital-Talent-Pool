from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os
import models
from schemas import auth_schema
from fastapi import HTTPException, status
 
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

class AuthService:
    # 1. Logika Register User Baru
    def create_user(self, db: Session, user: auth_schema.UserCreate):
        # Cek email duplikat
        existing_user = db.query(models.User).filter(models.User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email sudah terdaftar")
         
        hashed_password = pwd_context.hash(user.password)
         
        db_user = models.User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
 
        new_profile = models.Profile(user_id=db_user.id, full_name=user.username)
        db.add(new_profile)
        db.commit()
        
        return db_user
 
    def authenticate_user(self, db: Session, login_data: auth_schema.UserLogin):
        user = db.query(models.User).filter(models.User.email == login_data.email).first()
        
        if not user:
            return None
        
        if not pwd_context.verify(login_data.password, user.hashed_password):
            return None
            
        return user
    
    def create_access_token(self, data: dict):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt