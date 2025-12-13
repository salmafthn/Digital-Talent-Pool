import httpx
import os
from fastapi import HTTPException
from dotenv import load_dotenv
from app.schemas import ai_schema

load_dotenv()

class AIService:
    def __init__(self):
        # Pastikan ini mengarah ke IP VPS + Port yang benar (sesuai SSH Tunnel atau Direct)
        self.base_url = os.getenv("TIM_AI_URL", "http://127.0.0.1:5000")
    
    async def _post_request(self, endpoint: str, payload: dict):
        url = f"{self.base_url}{endpoint}"
        print(f"🚀 Nembak ke: {url} | Payload: {payload}") # Debugging (Opsional)

        try:
            # UBAH TIMEOUT DI SINI DARI 60.0 JADI 300.0 (5 Menit)
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=300.0) 
                
                # Cek respon error dari Tim 3
                if response.status_code >= 400:
                     print(f"❌ Error dari AI: {response.text}")
                
                response.raise_for_status()
                return response.json()
                
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"AI Error: {e.response.text}")
        except Exception as e:
            print(f"❌ Exception Fatal: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Gagal menghubungi AI Service (Timeout/Koneksi): {str(e)}")

    # A. INTERVIEW (Update Format Payload)
    async def get_interview_reply(self, prompt: str, history: list = []) -> ai_schema.InterviewResponse:
        payload = {
            "prompt": prompt,     # Isinya Data Profil User
            "history": history    # Isinya System Prompt
        }
        data = await self._post_request("/interview", payload)
        return ai_schema.InterviewResponse(**data)

    # B. TALENT MAPPING (Update Format Payload)
    async def analyze_talent_mapping(self, full_interview_text: str) -> ai_schema.MappingResponse:
        # Tim 3 minta 'input' dan 'history'. 
        # Karena mapping sifatnya rangkuman, kita masukkan text gabungan ke 'input' 
        # dan kosongkan history (atau sesuaikan kebutuhan mereka).
        
        payload = {
            "input": full_interview_text, 
            "history": [] # Kosongkan karena kita kirim full text di input
        }
        
        data = await self._post_request("/talent-mapping", payload)
        return ai_schema.MappingResponse(**data)

    # C. GENERATE SOAL (Cek apakah ini juga berubah?)
    async def generate_questions(self, area: str, level: int) -> ai_schema.QuestionResponse:
        # Asumsi endpoint ini masih format lama, kalau error ubah juga
        payload = {
            "area_fungsi": area,
            "level_kompetensi": level
        }
        data = await self._post_request("/question-generation", payload)
        return ai_schema.QuestionResponse(**data)