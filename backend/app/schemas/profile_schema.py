from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional, List
from datetime import date
from enum import Enum


class GenderEnum(str, Enum):
    LAKI_LAKI = "Laki-laki"
    PEREMPUAN = "Perempuan"

class EducationLevelEnum(str, Enum):
    SMA_SMK = "SMA/SMK"
    D3 = "D3"
    D4 = "D4"
    S1 = "S1"
    S2 = "S2"
    S3 = "S3"
    LAINNYA = "Lainnya"
    
class JobTypeEnum(str, Enum):
    KERJA = "Kerja"
    FREELANCE = "Freelance"
    MAGANG = "Magang" 
    TIDAK_BEKERJA = "Tidak/belum bekerja"

class FunctionalAreaEnum(str, Enum):
    IT_GOVERNANCE = "Tata Kelola Teknologi Informasi (IT Governance)"
    DIGITAL_PRODUCT = "Pengembangan Produk Digital (Digital Product Development)"
    DATA_AI = "Sains Data-Kecerdasan Artifisial (Data Science-AI)"
    CYBER_SECURITY = "Keamanan Informasi dan Siber"
    INFRASTRUCTURE = "Teknologi dan Infrastruktur"
    IT_SERVICES = "Layanan Teknologi Informasi"
    
    
SKILL_OPTIONS = [
    "Software Development", "Requirements Analysis", "Software Optimization", 
    "Usability", "Performance Tuning", "Maintainability", 
    "Backend Development", "System Design", "Scalability", 
    "Collaboration", "Teamwork", "Security", 
    "Reliability", "Clean Code", "Code Efficiency", 
    "Code Review", "Best Practices", "Error Handling", 
    "Monitoring", "Continuous Learning", "Backend Design", 
    "Quality Assurance", "Problem Solving", "Service Maintenance", 
    "Service Optimization", "Java Programming", "Object Oriented Programming", 
    "Communication", "English Proficiency", "SQL", 
    "API Development", "Microservices Architecture", "Service Oriented Architecture"
]

class EducationBase(BaseModel):
    level: EducationLevelEnum
    institution_name: Optional[str] = None
    faculty: Optional[str] = None
    major: Optional[str] = None
    enrollment_year: Optional[int] = None
    graduation_year: Optional[int] = None
    is_current: bool = False
    gpa: Optional[str] = None
    final_project_title: Optional[str] = None

    @model_validator(mode='after')
    def check_education_logic(self):
 
        if self.level == EducationLevelEnum.LAINNYA:
            self.institution_name = None
            self.faculty = None
            self.major = None
            self.enrollment_year = None
            self.graduation_year = None
            self.gpa = None
            self.final_project_title = None
            self.is_current = False # Default false
            return self
 
        if not self.institution_name:
            raise ValueError("Nama Institusi wajib diisi")
        if not self.major:
            raise ValueError("Jurusan wajib diisi")
        if not self.enrollment_year:
            raise ValueError("Tahun Masuk wajib diisi")
 
        if self.level == EducationLevelEnum.SMA_SMK:
            self.gpa = None
            self.faculty = None
            self.final_project_title = None
        
        if self.is_current and self.graduation_year is not None:
            raise ValueError("Jika masih menempuh pendidikan, tahun lulus tidak boleh diisi.")
            
        return self
    
class EducationCreate(EducationBase):
    pass

class EducationResponse(EducationBase):
    id: int
    class Config:
        from_attributes = True

# --- SCHEMAS UNTUK SERTIFIKASI ---
class CertificationBase(BaseModel):
    name: str
    organizer: str
    year: int
    proof_url: str  
    description: str  
    bidang_keahlian: str

    # Validasi Tahun: Rentang 5 tahun dari sekarang (Current Year +/- 5)
    @field_validator('year')
    def validate_year_range(cls, v):
        current_year = date.today().year
        min_year = current_year - 5
        max_year = current_year + 5
        
        if not (min_year <= v <= max_year):
            raise ValueError(f"Tahun sertifikasi harus valid antara {min_year} - {max_year}")
        return v

class CertificationCreate(CertificationBase):
    pass

class CertificationResponse(CertificationBase):
    id: int
    class Config:
        from_attributes = True

# --- SCHEMAS UNTUK PENGALAMAN ---
class ExperienceBase(BaseModel):
    job_type: JobTypeEnum                
    position: str                        
    company_name: str                   
    functional_area: FunctionalAreaEnum  
    start_date: date                     
    end_date: Optional[date] = None     
    is_current: bool = False       
    description: str

    # Validasi Logika: Jika masih bekerja, end_date harus kosong
    @model_validator(mode='after')
    def check_current_job(self):
        if self.is_current and self.end_date is not None:
            raise ValueError("Jika masih bekerja (Saat ini), tanggal selesai tidak boleh diisi.")
        
        # Validasi tambahan: Tanggal selesai tidak boleh sebelum tanggal mulai
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValueError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.")
            
        return self

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceResponse(ExperienceBase):
    id: int
    class Config:
        from_attributes = True

# --- SCHEMAS UNTUK PROFILE UTAMA ---
class ProfileUpdate(BaseModel):
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    instagram_username: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None    
    skills: Optional[List[str]] = None
 
    @field_validator('skills')
    def validate_skills(cls, v):
        if v: 
            valid_skills_lower = [s.lower() for s in SKILL_OPTIONS]
            for skill in v:
                if skill.lower() not in valid_skills_lower:
                    raise ValueError(f"Skill '{skill}' tidak valid. Pilih dari daftar yang tersedia.")
        return v

class ProfileFullResponse(BaseModel):
    id: int
    user_id: int
    
    email: Optional[str] = None
    nik: Optional[str] = None
    full_name: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[date] = None
    
    phone: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None 
    instagram_username: Optional[str] = None
    
    avatar_url: Optional[str] = None
    skills: List[str] = [] 
    
    # Nested Objects
    educations: List[EducationResponse] = []
    certifications: List[CertificationResponse] = []
    experiences: List[ExperienceResponse] = []

    class Config:
        from_attributes = True