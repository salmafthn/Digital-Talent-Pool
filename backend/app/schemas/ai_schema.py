from pydantic import BaseModel
from typing import Dict, List, Optional

# --- A. SCHEMA INTERVIEW ---
class InterviewRequest(BaseModel):
    prompt: str

class InterviewData(BaseModel):
    answer: str

class InterviewResponse(BaseModel):
    success: bool
    message: str
    data: InterviewData

# --- B. SCHEMA TALENT MAPPING ---
class MappingRequest(BaseModel):
    prompt: str 

class CompetencyLevel(BaseModel):
    level_kompetensi: int
    kecocokan: float
    status: str = "unassessed"

class MappingData(BaseModel):
    Tata_Kelola_TI: Optional[CompetencyLevel] = None
    Pengembangan_Produk_Digital: Optional[CompetencyLevel] = None
    Sains_Data_Kecerdasan_Artifisial: Optional[CompetencyLevel] = None
    Keamanan_Informasi_dan_Siber: Optional[CompetencyLevel] = None
    Teknologi_dan_Infrastruktur: Optional[CompetencyLevel] = None
    Layanan_TI: Optional[CompetencyLevel] = None

    class Config:
        populate_by_name = True

class MappingResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, CompetencyLevel] 
    

# --- C. SCHEMA QUESTION GENERATION ---
class QuestionRequest(BaseModel):
    area_fungsi: str
    level_kompetensi: int

class QuestionOption(BaseModel):
    a: str
    b: str
    c: str
    d: str

class QuestionItem(BaseModel):
    nomor_soal: int
    aspek_kritis: str
    soal: str
    opsi_jawaban: QuestionOption
    jawaban_benar: str

class QuestionData(BaseModel):
    area_fungsi: str
    level_kompetensi: int
    kumpulan_soal: List[QuestionItem]

class QuestionResponse(BaseModel):
    success: bool
    message: str
    data: QuestionData
    
class ChatLogResponse(BaseModel):
    id: int
    user_prompt: str
    ai_response: str
    # created_at: datetime (opsional jika ingin menampilkan jam)

    class Config:
        from_attributes = True
        
        
# --- D. SCHEMA ASSESSMENT SUBMIT (BARU) ---
class AssessmentAnswerItem(BaseModel):
    nomor_soal: int
    soal: str
    opsi_jawaban: Dict[str, str] # { "a": "...", "b": "..." }
    jawaban_user: str # Jawaban yang dipilih user (misal: "Big Data adalah...")
    kunci_jawaban: str # Kunci dari AI (misal: "a")

class AssessmentSubmitRequest(BaseModel):
    area_fungsi: str
    jawaban: List[AssessmentAnswerItem]

class AssessmentResultResponse(BaseModel):
    success: bool
    score: float
    message: str