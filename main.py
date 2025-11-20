from fastapi import FastAPI, HTTPException
from database import supabase
from schemas import ProfileUpdate, ProfileResponse, ChatRequest, ChatResponse, AssessmentMockResponse, AssessmentSubmit, AssessmentResult, DashboardResponse
import json
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = FastAPI(title="DTP Backend API")

@app.get("/")
def read_root():
    return {"message": "API DTP siap digunakan!"}

@app.get("/api/profile/{user_id}", response_model=ProfileResponse)
def get_profile(user_id: str):
    response = supabase.table("profiles").select("*").eq("id", user_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return response.data[0]

@app.put("/api/profile/{user_id}")
def update_profile(user_id: str, profile: ProfileUpdate):
    data_to_update = profile.dict(exclude_unset=True)
    
    if not data_to_update:
        raise HTTPException(status_code=400, detail="No data provided to update")

    response = supabase.table("profiles").update(data_to_update).eq("id", user_id).execute()
    
    if not response.data:
         raise HTTPException(status_code=404, detail="Profile not found or update failed")

    return {"message": "Profile updated successfully", "data": response.data[0]}

@app.post("/api/chat/real", response_model=ChatResponse)
def chat_gemini(request: ChatRequest):
    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        print("Error: API Key tidak ditemukan di .env") 
        return {"reply": "Server Error: API Key Gemini belum disetting."}

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=request.message
        )
        return {"reply": response.text}
        
    except Exception as e:
        print(f"Error Gemini Asli: {e}") 
        return {"reply": f"Maaf, terjadi kesalahan: {str(e)}"} 

@app.post("/api/mapping/calculate-level")
def calculate_level_mock(user_id: str):
    response = supabase.table("profiles").select("experience_months, job_title").eq("id", user_id).execute()
    
    if not response.data:
        return {"level": "Unknown", "reason": "Profile not found"}
        
    profile = response.data[0]
    exp = profile.get("experience_months", 0) or 0
    
    if exp > 60:
        level = "Expert (Level 8-9)"
    elif exp > 24:
        level = "Senior (Level 6-7)"
    elif exp > 12:
        level = "Associate (Level 5)"
    else:
        level = "Junior (Level 3-4)"
        
    return {
        "user_id": user_id,
        "calculated_level": level,
        "basis": f"Based on {exp} months of experience"
    }

@app.post("/api/assessment/generate", response_model=AssessmentMockResponse)
def generate_assessment_mock(user_id: str):
    try:
        with open("bank_soal.json", "r") as f:
            questions = json.load(f)
    except FileNotFoundError:
        questions = []

    return {
        "total_soal": len(questions),
        "level_prediksi": "Associate Data Scientist",
        "questions": questions
    }

@app.post("/api/assessment/submit", response_model=AssessmentResult)
def submit_assessment(submission: AssessmentSubmit):
    try:
        with open("bank_soal.json", "r") as f:
            questions = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Bank soal not found")

    correct_count = 0
    total_questions = len(questions)
    
    for q in questions:
        q_id = str(q["id"])
        user_answer = submission.answers.get(q_id)
        if user_answer == q["correct_option"]:
            correct_count += 1

    score = (correct_count / total_questions) * 100 if total_questions > 0 else 0
    
    supabase.table("assessments").insert({
        "profile_id": submission.user_id,
        "score": score,
        "raw": submission.answers
    }).execute()

    return {
        "score": score,
        "correct_count": correct_count,
        "total_questions": total_questions,
        "message": "Assessment submitted successfully"
    }

@app.get("/api/dashboard/{user_id}", response_model=DashboardResponse)
def get_dashboard(user_id: str):
    profile_res = supabase.table("profiles").select("full_name, experience_months").eq("id", user_id).execute()
    
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    profile = profile_res.data[0]
    exp = profile.get("experience_months", 0) or 0

    if exp > 60:
        level = "Expert (Level 8-9)"
    elif exp > 24:
        level = "Senior (Level 6-7)"
    elif exp > 12:
        level = "Associate (Level 5)"
    else:
        level = "Junior (Level 3-4)"

    try:
        with open("recommendations.json", "r") as f:
            rec_data = json.load(f)
            recommendations = rec_data.get(level, rec_data["Junior (Level 3-4)"])
    except FileNotFoundError:
        recommendations = {"jobs": [], "modules": []}

    assessment_res = supabase.table("assessments").select("score").eq("profile_id", user_id).order("created_at", desc=True).limit(1).execute()
    
    progress = 0
    if assessment_res.data:
        progress = 100 
    elif exp > 0:
        progress = 50 
    else:
        progress = 10 

    return {
        "full_name": profile["full_name"] or "User",
        "current_level": level,
        "progress_percentage": progress,
        "jobs": recommendations["jobs"],
        "modules": recommendations["modules"]
    }