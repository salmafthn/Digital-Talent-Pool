from fastapi import APIRouter, Depends
from app.services.ai_service import AIService
from app.schemas import ai_schema
from app.api import deps
from app import models

router = APIRouter(prefix="/ai", tags=["AI Integration"])
ai_service = AIService()
 
@router.post("/interview", response_model=ai_schema.InterviewResponse)
async def chat_interview(
    request: ai_schema.InterviewRequest,
    current_user: models.User = Depends(deps.get_current_user)
): 
    return await ai_service.get_interview_reply(request.prompt)
 
@router.post("/mapping", response_model=ai_schema.MappingResponse)
async def talent_mapping(
    request: ai_schema.MappingRequest,
    current_user: models.User = Depends(deps.get_current_user)
): 
    result = await ai_service.analyze_talent_mapping(request.prompt)
    return result
 
@router.post("/questions", response_model=ai_schema.QuestionResponse)
async def generate_questions(
    request: ai_schema.QuestionRequest,
    current_user: models.User = Depends(deps.get_current_user)
):
    return await ai_service.generate_questions(request.area_fungsi, request.level_kompetensi)