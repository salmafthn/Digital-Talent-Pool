import httpx
import os
from fastapi import HTTPException
from dotenv import load_dotenv
from app.schemas import ai_schema

load_dotenv()

class AIService:
    def __init__(self):
        # Ambil URL Tim AI dari .env
        self.base_url = os.getenv("TIM_AI_URL", "http://127.0.0.1:8001")
    
    async def _post_request(self, endpoint: str, payload: dict):
        url = f"{self.base_url}{endpoint}"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=60.0) # Timeout 60 detik karena AI lama
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"AI Service Error: {e.response.text}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gagal menghubungi AI Service: {str(e)}")

    # A. INTERVIEW
    async def get_interview_reply(self, prompt: str) -> ai_schema.InterviewResponse:
        payload = {"prompt": prompt}
        data = await self._post_request("/interview", payload)
        return ai_schema.InterviewResponse(**data)

    # B. TALENT MAPPING
    async def analyze_talent_mapping(self, full_interview_text: str) -> ai_schema.MappingResponse:
        payload = {"prompt": full_interview_text}
        data = await self._post_request("/talent-mapping", payload)
        return ai_schema.MappingResponse(**data)

    # C. GENERATE SOAL
    async def generate_questions(self, area: str, level: int) -> ai_schema.QuestionResponse:
        payload = {
            "area_fungsi": area,
            "level_kompetensi": level
        }
        data = await self._post_request("/question-generation", payload)
        return ai_schema.QuestionResponse(**data)