from fastapi import FastAPI, Request, status
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from app.core.db import engine, Base 
from app.api.main import api_router   
from app import models               

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DTP Backend API")

# Setup Folder Uploads
os.makedirs("uploads/certifications", exist_ok=True)
os.makedirs("uploads/avatars", exist_ok=True)

# Mount Static Files
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# Setup CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://85.218.235.6:39997",
    "http://85.218.235.6:39927",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Error Handler (Bahasa Indonesia)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    
    field_translations = {
        "major": "Jurusan",
        "institution_name": "Nama Institusi",
        "enrollment_year": "Tahun Masuk",
        "level": "Jenjang Pendidikan",
        "gpa": "IPK",
        "email": "Email",
        "password": "Password",
        "username": "Username",
        "faculty": "Fakultas",
        "final_project_title": "Judul Tugas Akhir",
        "job_type": "Jenis Pekerjaan"
    }

    for error in exc.errors():
        field_name = error["loc"][-1] if error["loc"] else "unknown"
        readable_field = field_translations.get(str(field_name), str(field_name))
        
        error_type = error["type"]
        input_value = error.get("input")

        if error_type == "missing" or input_value is None:
            msg = f"Tolong input {readable_field} (wajib diisi)"
        elif "type" in error_type:
            msg = f"Format {readable_field} tidak valid"
        elif error_type == "value_error":
            msg = error["msg"].replace("Value error, ", "")
        else:
            msg = error["msg"]

        errors.append({
            "field": field_name,
            "msg": msg
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": errors, "message": "Terjadi kesalahan validasi data"}
    )

# --- ROUTER UTAMA ---
app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "DTP Backend Modular is Ready!"}
