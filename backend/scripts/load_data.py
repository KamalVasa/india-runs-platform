import sys
import os
import json
import gzip

# Ensure the backend directory is in the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from db.session import SessionLocal, engine, Base
from models.candidate import CandidateModel
from services.data_cleaner import validate_candidate

def load_data(filepath: str):
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    batch_size = 5000
    candidates_to_insert = []
    
    print(f"Loading and validating candidate data from {filepath}...")
    
    # Support both raw JSONL and GZ compressed dataset files
    open_func = gzip.open if filepath.endswith('.gz') else open
    mode = 'rt' if filepath.endswith('.gz') else 'r'
    
    try:
        with open_func(filepath, mode) as f:
            for i, line in enumerate(f):
                if not line.strip(): 
                    continue
                
                try:
                    raw_data = json.loads(line)
                    # Run through production cleaner/validator
                    data = validate_candidate(raw_data)
                except json.JSONDecodeError:
                    print(f"Warning: Skipping invalid JSON on line {i}")
                    continue
                
                profile = data.get("profile", {})
                signals = data.get("redrob_signals", {})
                
                c = CandidateModel(
                    candidate_id=data["candidate_id"],
                    anonymized_name=profile.get("anonymized_name", ""),
                    headline=profile.get("headline", ""),
                    summary=profile.get("summary", ""),
                    location=profile.get("location", ""),
                    country=profile.get("country", ""),
                    years_of_experience=profile.get("years_of_experience", 0.0),
                    current_title=profile.get("current_title", ""),
                    current_company=profile.get("current_company", ""),
                    career_history=data.get("career_history", []),
                    education=data.get("education", []),
                    skills=data.get("skills", []),
                    certifications=data.get("certifications", []),
                    languages=data.get("languages", []),
                    redrob_signals=signals,
                    github_activity_score=signals.get("github_activity_score", -1.0),
                    recruiter_response_rate=signals.get("recruiter_response_rate", 0.0),
                    last_active_date=signals.get("last_active_date", "")
                )
                candidates_to_insert.append(c)
                
                if len(candidates_to_insert) >= batch_size:
                    db.bulk_save_objects(candidates_to_insert)
                    db.commit()
                    print(f"Inserted {i+1} records...")
                    candidates_to_insert = []
                    
            if candidates_to_insert:
                db.bulk_save_objects(candidates_to_insert)
                db.commit()
                print(f"Inserted remaining records. Total processed: {i+1}")
                
    except Exception as e:
        print(f"Error loading data: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("Data loading complete.")

if __name__ == "__main__":
    # Check for dataset paths, prioritize raw then compressed
    possible_paths = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "sample_candidates.jsonl"),
        "/Users/kamal/India_runs/dataset/India_runs_data_and_ai_challenge/candidates.jsonl",
        "/Users/kamal/India_runs/[PUB] India_runs_data_and_ai_challenge/India_runs_data_and_ai_challenge/candidates.jsonl",
        "/Users/kamal/India_runs/[PUB] India_runs_data_and_ai_challenge/India_runs_data_and_ai_challenge/candidates.jsonl.gz"
    ]
    
    loaded = False
    for path in possible_paths:
        if os.path.exists(path):
            load_data(path)
            loaded = True
            break
            
    if not loaded:
        print("Dataset not found. Please verify the dataset path in the workspace.")
