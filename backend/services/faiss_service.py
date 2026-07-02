import numpy as np
import os
import json

class FAISSService:
    def __init__(self, index_path="data/faiss.index", id_path="data/candidate_ids.json"):
        self.index_path = index_path
        self.id_path = id_path
        self.index = None
        self.candidate_ids = []
                
    def load_index(self):
        if os.path.exists(self.index_path) and os.path.exists(self.id_path):
            import faiss
            self.index = faiss.read_index(self.index_path)
            with open(self.id_path, "r") as f:
                self.candidate_ids = json.load(f)
    
    def search(self, query_embedding, k=1000):
        if not self.index:
            self.load_index()
            if not self.index:
                return [] # Index not built yet
        
        query_vector = np.array([query_embedding]).astype('float32')
        distances, indices = self.index.search(query_vector, k)
        
        results = []
        # L2 distance: lower is better. We invert to semantic score.
        for dist, idx in zip(distances[0], indices[0]):
            if idx != -1:
                results.append({
                    "candidate_id": self.candidate_ids[idx],
                    "semantic_score": float(1.0 / (1.0 + dist))
                })
        return results

faiss_service = FAISSService()
