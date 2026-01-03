from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Date, Text, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    profile = relationship("Profile", back_populates="user", uselist=False)
    logs = relationship("InterviewLog", back_populates="user")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    nik = Column(String, unique=True)
    full_name = Column(String)
    gender = Column(String)
    birth_date = Column(Date)
    phone = Column(String)
    linkedin_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    address = Column(Text)
    bio = Column(Text)
    avatar_url = Column(String)
    skills = Column(JSON, default=[])
    linkedin_url = Column(String, nullable=True)
    instagram_username = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="profile")
    educations = relationship("Education", back_populates="profile")
    certifications = relationship("Certification", back_populates="profile")
    experiences = relationship("Experience", back_populates="profile")
    
    mappings = relationship("Mapping", back_populates="profile")
    assessment_attempts = relationship("AssessmentAttempt", back_populates="profile")
    final_levels = relationship("FinalLevel", back_populates="profile")

class Education(Base):
    __tablename__ = "educations"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"))
    level = Column(String) 
    institution_name = Column(String)
    faculty = Column(String, nullable=True)       # Baru: Fakultas
    major = Column(String)                        # Jurusan
    enrollment_year = Column(Integer)             # Baru: Tahun Masuk
    graduation_year = Column(Integer, nullable=True) # Tahun Lulus (Bisa null jika masih menempuh)
    is_current = Column(Boolean, default=False)   # Baru: Masih menempuh?
    gpa = Column(String, nullable=True)           # IPK (Null jika SMA)
    final_project_title = Column(String, nullable=True) # Baru: Judul TA

    profile = relationship("Profile", back_populates="educations")
    

class Certification(Base):
    __tablename__ = "certifications"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"))
    
    name = Column(String)
    organizer = Column(String)
    year = Column(Integer)
    proof_url = Column(String)
    description = Column(Text)
     
    bidang_keahlian = Column(String, nullable=True) 
 

    profile = relationship("Profile", back_populates="certifications")

class Experience(Base):
    __tablename__ = "experiences"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"))
    
    position = Column(String)                     # Jabatan
    company_name = Column(String)                 # Nama Perusahaan
    job_type = Column(String)                     # Enum: Fulltime, Kontrak, Magang
    functional_area = Column(String)              # Baru: Bidang Pekerjaan (IT Governance, dll)
    start_date = Column(Date)                     # Tanggal Mulai
    end_date = Column(Date, nullable=True)        # Tanggal Selesai (Bisa null)
    is_current = Column(Boolean, default=False)   # Baru: Masih bekerja disini?
    description = Column(Text)

    profile = relationship("Profile", back_populates="experiences")

#

class Mapping(Base):
    __tablename__ = "mappings"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"))
    
    sumber = Column(String)
    okupasi = Column(String)
    area_fungsi = Column(String)
    confidence = Column(Float)
    is_revised = Column(Boolean, default=False)
    note = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("Profile", back_populates="mappings")

class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"))
    
    status = Column(String, default="ongoing")
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    profile = relationship("Profile", back_populates="assessment_attempts")
    answers = relationship("AssessmentAnswer", back_populates="attempt")
    result = relationship("AssessmentResult", back_populates="attempt", uselist=False)

class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"
    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("assessment_attempts.id"))
    
    question_no = Column(Integer)
    question_text = Column(Text)
    options = Column(JSON)
    chosen_option = Column(String)
    correct_option = Column(String)
    is_correct = Column(Boolean)

    attempt = relationship("AssessmentAttempt", back_populates="answers")

class AssessmentResult(Base):
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("assessment_attempts.id"))
    profile_id = Column(Integer, ForeignKey("profiles.id"))
    
    score = Column(Float)
    threshold = Column(Float)
    raw_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    attempt = relationship("AssessmentAttempt", back_populates="result")

class FinalLevel(Base):
    __tablename__ = "final_levels"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"))
    
    level = Column(String)
    rekomendasi_belajar = Column(Text)
    rekomendasi_pekerjaan = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("Profile", back_populates="final_levels")
    

class InterviewLog(Base):
    __tablename__ = "interview_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Apa yang user ketik
    user_prompt = Column(Text, nullable=False)
    
    # Apa yang AI jawab
    ai_response = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relasi ke User
    user = relationship("User", back_populates="logs")

 