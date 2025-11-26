# backend/app/schemas/__init__.py

# Import dari auth_schema
from .auth_schema import (
    UserCreate,
    UserLogin,
    Token,
    TokenData
)

# Import dari profile_schema
from .profile_schema import (
    ProfileUpdate,
    ProfileFullResponse, # <--- Pastikan pakai nama ini (bukan ProfileResponse)
    EducationCreate,
    EducationResponse,
    CertificationCreate,
    CertificationResponse,
    ExperienceCreate,
    ExperienceResponse,
    # Enums
    GenderEnum,
    EducationLevelEnum,
    JobTypeEnum,
    FunctionalAreaEnum
)

# Jika Anda punya chat schema, import disini
# from .ai_schema import ...