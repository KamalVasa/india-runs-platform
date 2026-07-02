class JobEngine:
    def __init__(self):
        self.model = None

    def get_model(self):
        if self.model is None:
            print("Loading Job Engine embedding model...")
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
        return self.model

    def embed_job_description(self, jd_text: str):
        model = self.get_model()
        return model.encode([jd_text])[0]

job_engine = JobEngine()
