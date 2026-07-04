from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.session import get_db
from models.candidate import CandidateModel
from services.explainability_engine import generate_match_report, get_gemini_model

router = APIRouter()

DEFAULT_JD = "Senior AI Engineer. Production experience with embeddings, vector databases like FAISS, Pinecone. Python programming. Evaluation frameworks like NDCG. Needs product company experience."

class CopilotQuery(BaseModel):
    query: str

@router.post("/explain/{candidate_id}")
def explain_candidate(candidate_id: str, db: Session = Depends(get_db)):
    cand = db.query(CandidateModel).filter(CandidateModel.candidate_id == candidate_id).first()
    
    cand_dict = None
    if cand:
        cand_dict = {
            "title": cand.current_title,
            "experience": cand.years_of_experience,
            "history": cand.career_history
        }
    else:
        # Fallback to expanded JSON
        import os, json
        json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "top_100_candidates.json")
        if os.path.exists(json_path):
            with open(json_path, 'r') as f:
                top_100 = json.load(f)
                for res in top_100:
                    if res["candidate"]["candidate_id"] == candidate_id:
                        cand_dict = {
                            "title": res["candidate"].get("current_title", ""),
                            "experience": res["candidate"].get("years_of_experience", 0),
                            "history": res["candidate"].get("career_history", [])
                        }
                        break
                        
    if not cand_dict:
        raise HTTPException(status_code=404, detail="Candidate not found")

    
    report = generate_match_report(cand_dict, DEFAULT_JD)
    return report

@router.post("/copilot")
def copilot_query(payload: CopilotQuery):
    model = get_gemini_model()
    
    prompt = f"You are an AI Recruiter Copilot. The recruiter asks: {payload.query}. Provide a concise, professional answer."
    
    try:
        response = model.generate_content(prompt)
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")

@router.post("/interview/{candidate_id}")
def generate_interview_questions(candidate_id: str, db: Session = Depends(get_db)):
    cand = db.query(CandidateModel).filter(CandidateModel.candidate_id == candidate_id).first()
    
    cand_title = ""
    cand_exp = 0
    if cand:
        cand_title = cand.current_title
        cand_exp = cand.years_of_experience
    else:
        # Fallback to JSON
        import os, json
        json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "top_100_candidates.json")
        if os.path.exists(json_path):
            with open(json_path, 'r') as f:
                top_100 = json.load(f)
                for res in top_100:
                    if res["candidate"]["candidate_id"] == candidate_id:
                        cand_title = res["candidate"].get("current_title", "")
                        cand_exp = res["candidate"].get("years_of_experience", 0)
                        break
                        
    if not cand_title:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    model = get_gemini_model()
    prompt = f"Based on this candidate ({cand_title}, {cand_exp} yrs exp) and the JD: {DEFAULT_JD}, generate 3 highly targeted interview questions to probe their technical weaknesses."
    
    try:
        response = model.generate_content(prompt)
        return {"questions": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")

