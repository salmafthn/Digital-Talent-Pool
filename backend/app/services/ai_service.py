import httpx
import os
from fastapi import HTTPException
from dotenv import load_dotenv
from app.schemas import ai_schema

load_dotenv()

class AIService:
    def __init__(self): 
        self.base_url = os.getenv("TIM_AI_URL", "http://127.0.0.1:5000")
    
    async def _post_request(self, endpoint: str, payload: dict):
        url = f"{self.base_url}{endpoint}"
        print(f"🚀 Nembak ke: {url} | Payload: {payload}") 

        try:
 
            timeout_config = httpx.Timeout(300.0, connect=60.0)
 
            async with httpx.AsyncClient(timeout=timeout_config) as client:
                response = await client.post(
                    url, 
                    json=payload,
                    headers={"Connection": "close"}  
                ) 
                
                if response.status_code >= 400:
                     print(f"❌ Error dari AI: {response.text}")
                
                response.raise_for_status()
                return response.json()
                
        except httpx.RemoteProtocolError:
            
            print("❌ AI Service putus koneksi mendadak.")
            raise HTTPException(status_code=502, detail="AI Service terputus di tengah jalan. Kemungkinan server AI restart/crash.")
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"AI Error: {e.response.text}")
        except Exception as e:
            print(f"❌ Exception Fatal: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Gagal menghubungi AI Service (Timeout/Koneksi): {str(e)}")

    # A. INTERVIEW (Update Format Payload)
    async def get_interview_reply(self, prompt: str) -> ai_schema.InterviewResponse:
        payload = {
            "prompt": prompt
        }
        data = await self._post_request("/interview", payload) 
        return ai_schema.InterviewResponse(**data)
 
    async def analyze_talent_mapping(self, full_interview_text: str) -> ai_schema.MappingResponse:
 
        
        payload = {
            "input": full_interview_text, 
            "history": []  
        }
        
        data = await self._post_request("/talent-mapping", payload)
        return ai_schema.MappingResponse(**data)
 
    async def generate_questions(self, area: str, level: int) -> ai_schema.QuestionResponse:
 
        payload = {
            "area_fungsi": area,
            "level_kompetensi": level
        }
        data = await self._post_request("/question-generation", payload)
        return ai_schema.QuestionResponse(**data)