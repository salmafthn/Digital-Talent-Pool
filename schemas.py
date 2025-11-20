from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    education_level: Optional[str] = None
    institution: Optional[str] = None
    study_program: Optional[str] = None
    training_type: Optional[str] = None
    certification_name: Optional[str] = None
    certification_level: Optional[str] = None
    certification_desc: Optional[str] = None
    job_title: Optional[str] = None
    experience_months: Optional[int] = None
    authority: Optional[str] = None
    avatar_url: Optional[str] = None

class ProfileUpdate(ProfileBase):
    pass 

class ProfileResponse(ProfileBase):
    id: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True
        
class ChatRequest(BaseModel):
    message: str
    history: Optional[list] = []

class ChatResponse(BaseModel):
    reply: str

class Question(BaseModel):
    id: int
    text: str
    options: list[str]
    correct_option: str

class AssessmentMockResponse(BaseModel):
    total_soal: int
    level_prediksi: str
    questions: list[Question]

class AssessmentSubmit(BaseModel):
    user_id: str
    answers: dict[str, str]

class AssessmentResult(BaseModel):
    score: float
    correct_count: int
    total_questions: int
    message: str

class JobRecommendation(BaseModel):
    title: str
    company: str
    desc: str

class ModuleRecommendation(BaseModel):
    title: str
    platform: str

class DashboardResponse(BaseModel):
    full_name: str
    current_level: str
    progress_percentage: int
    jobs: list[JobRecommendation]
    modules: list[ModuleRecommendation]