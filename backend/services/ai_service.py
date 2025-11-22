import httpx
import os

class AIService:
    def __init__(self):
        self.chat_url = os.getenv("TIM3_CHAT_URL")
        self.mapping_url = os.getenv("TIM3_MAPPING_URL")

    async def get_chat_response(self, message: str, history: list):
        if "mock" in self.chat_url:
            return {
                "reply": "Ini balasan Mocking. Tim 3 belum siap.",
                "context_used": False
            }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(self.chat_url, json={
                "message": message,
                "history": history
            })
            response.raise_for_status()
            return response.json()

    async def get_level_mapping(self, chat_history: list):
        if "mock" in self.mapping_url:
            return {
                "level": "Associate (Level 5)",
                "job_recommendation": "Data Scientist",
                "confidence": 0.85
            }

        async with httpx.AsyncClient() as client:
            response = await client.post(self.mapping_url, json={
                "history": chat_history
            })
            response.raise_for_status()
            return response.json()