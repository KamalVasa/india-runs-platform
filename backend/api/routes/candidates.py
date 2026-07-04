from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from services.ranking_engine import rank_candidates
from models.candidate import CandidateModel

router = APIRouter()

# Default JD loaded from the txt file ideally. For now, a quick summary string.
DEFAULT_JD = "Senior AI Engineer. Production experience with embeddings, vector databases like FAISS, Pinecone. Python programming. Evaluation frameworks like NDCG. Needs product company experience."

@router.get("")
def get_ranked_candidates(db: Session = Depends(get_db)):
    results = rank_candidates(db, DEFAULT_JD, top_n=100)
    
    formatted = []
    for idx, res in enumerate(results):
        cand = res["candidate"]
        # Handle both SQLAlchemy objects and raw dictionaries
        is_dict = isinstance(cand, dict)
        formatted.append({
            "rank": idx + 1,
            "candidate_id": cand.get("candidate_id") if is_dict else cand.candidate_id,
            "anonymized_name": cand.get("anonymized_name") if is_dict else cand.anonymized_name,
            "current_title": cand.get("current_title") if is_dict else cand.current_title,
            "years_of_experience": cand.get("years_of_experience") if is_dict else cand.years_of_experience,
            "score": round(res["score"], 4),
            "github_activity_score": cand.get("github_activity_score") if is_dict else cand.github_activity_score,
            "recruiter_response_rate": cand.get("recruiter_response_rate") if is_dict else cand.recruiter_response_rate
        })
    return formatted

@router.get("/{candidate_id}")
def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    # First try checking the hardcoded top_100_candidates JSON because the DB might not have all records
    import os, json
    json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "top_100_candidates.json")
    if os.path.exists(json_path):
        with open(json_path, 'r') as f:
            top_100 = json.load(f)
            for res in top_100:
                if res["candidate"]["candidate_id"] == candidate_id:
                    return res["candidate"]
                    
    # Fallback to DB
    cand = db.query(CandidateModel).filter(CandidateModel.candidate_id == candidate_id).first()
    if not cand:
        return {"error": "Candidate not found"}
    return cand
