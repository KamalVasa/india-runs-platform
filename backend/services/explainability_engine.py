import google.generativeai as genai
from core.config import settings
from fastapi import HTTPException
import json

# Safely configure Gemini - Fallback without crashing
ai_configured = False
try:
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE":
        genai.configure(api_key=settings.GEMINI_API_KEY)
        ai_configured = True
except Exception as e:
    print(f"Error configuring Gemini: {e}")
    pass

def generate_offline_reasoning(candidate, score) -> str:
    """
    Deterministic rule-based reasoning for the CSV hackathon submission 
    that runs offline under 5 minutes without LLM API calls.
    """
    reason = f"{candidate.current_title} with {candidate.years_of_experience} yrs experience."
    if candidate.github_activity_score > 0:
        reason += f" Active GitHub ({candidate.github_activity_score})."
    if candidate.recruiter_response_rate > 0.5:
        reason += f" High response rate ({candidate.recruiter_response_rate})."
    return reason

def get_gemini_model():
    if not ai_configured:
        raise HTTPException(
            status_code=503, 
            detail="Gemini API Key is missing. Please set GEMINI_API_KEY in .env. AI features are currently disabled."
        )
    return genai.GenerativeModel('gemini-1.5-flash')

def generate_match_report(candidate_json: dict, jd_text: str) -> dict:
    model = get_gemini_model()
    prompt = f"""
    Analyze this candidate for the JD.
    Candidate: {json.dumps(candidate_json)}
    JD: {jd_text}
    
    Provide a detailed match report outlining Strengths, Weaknesses, Missing Skills, and a Hiring Recommendation.
    """
    
    try:
        response = model.generate_content(prompt)
        return {"report": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")
