from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
from enum import Enum
 
class GenderEnum(str, Enum):
    LAKI_LAKI = "Laki-laki"
    PEREMPUAN = "Perempuan"

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
     
    nik: str
    full_name: str
    gender: GenderEnum
    birth_date: date

class UserLogin(BaseModel):
    email: EmailStr
    password: str
 
class Token(BaseModel):
    access_token: str
    token_type: str
 
class TokenData(BaseModel):
    email: str | None = None