from fastapi import APIRouter
from app.api.routes import auth, profile
from app.api.routes import auth, profile, ai_integration

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(ai_integration.router)