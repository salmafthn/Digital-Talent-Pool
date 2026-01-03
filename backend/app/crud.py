from sqlalchemy.orm import Session
from app import models, schemas
from app.core.security import get_password_hash

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    # 1. Hash password
    hashed_password = get_password_hash(user.password)
    
    # 2. Buat User Object
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
     
    db.flush() 
    
    # 3. Buat Profile Object
    db_profile = models.Profile(
        user_id=db_user.id,  
        full_name=user.full_name,
        nik=user.nik,
        gender=user.gender.value,
        birth_date=user.birth_date
    )
    db.add(db_profile)
    
    db.commit()
    
    db.refresh(db_user)
    return db_user