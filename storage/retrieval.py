"""Resume retrieval logic using vector similarity search."""

from typing import Optional

from storage.config import (
    EMBEDDING_MODEL_NAME,
    QDRANT_COLLECTION_NAME,
    QDRANT_HOST,
    QDRANT_PORT,
)

try:
    from fastembed import TextEmbedding
    from qdrant_client import QdrantClient
    from qdrant_client.models import PointStruct
    _HAS_DEPS = True
except ImportError:
    _HAS_DEPS = False


class MockResumeRetriever:
    """Mock retriever for testing without Qdrant running."""
    
    def __init__(self):
        from storage.sample_resumes import SAMPLE_RESUMES
        self._candidates = SAMPLE_RESUMES
    
    def search(self, query: str, top_k: int = 5) -> list:
        """Return mock candidates based on query keywords."""
        query_lower = query.lower()
        scored = []
        
        stop_words = {"a", "an", "the", "and", "or", "but", "if", "then", "else", "when", 
                      "at", "by", "for", "from", "in", "into", "of", "off", "on", "onto",
                      "out", "over", "to", "up", "with", "is", "was", "were", "be", "been",
                      "being", "have", "has", "had", "do", "does", "did", "looking", "expertise"}
        
        synonyms = {"golang": "go", "k8s": "kubernetes", "docker": "container"}
        jd_words = [synonyms.get(w, w) for w in query_lower.replace(",", " ").split() if w not in stop_words and len(w) >= 2]
        
        for idx, resume in enumerate(self._candidates):
            score = 0.5  # base
            text = (resume.get("content", "") + " " + " ".join(resume.get("skills", []))).lower()
            for word in jd_words:
                if word in text:
                    score += 0.1
            scored.append({
                "candidate_id": resume["id"],
                "name": resume["name"],
                "resume_text": resume["content"],
                "skills": resume.get("skills", []),
                "experience": resume.get("experience"),
                "score": min(score, 1.0),
            })
        
        return sorted(scored, key=lambda x: x["score"], reverse=True)[:top_k]
    
    def get_resume(self, resume_id: int) -> Optional[dict]:
        for r in self._candidates:
            if r["id"] == resume_id:
                return {
                    "candidate_id": r["id"],
                    "name": r["name"],
                    "resume_text": r["content"],
                    "skills": r.get("skills", []),
                    "experience": r.get("experience"),
                }
        return None
    
    def ingest_candidate(self, candidate: dict) -> dict:
        raise RuntimeError("Mock mode does not support ingestion")


class ResumeRetriever:
    """Handles resume search and retrieval using vector embeddings."""

    def __init__(
        self,
        collection_name=QDRANT_COLLECTION_NAME,
        host=QDRANT_HOST,
        port=QDRANT_PORT,
        mock_mode: bool = False,
    ):
        self.mock_mode = mock_mode or not _HAS_DEPS
        
        if self.mock_mode:
            self._mock_retriever = MockResumeRetriever()
            return
        
        self.client = QdrantClient(host=host, port=port)
        self.model = TextEmbedding(model_name=EMBEDDING_MODEL_NAME)
        self.collection_name = collection_name

    def search(self, query: str, top_k: int = 5) -> list:
        """Search for resumes similar to the query."""
        if self.mock_mode:
            return self._mock_retriever.search(query, top_k)
        
        query_embedding = list(self.model.embed([query]))[0].tolist()

        results = self.client.query_points(
            collection_name=self.collection_name,
            query=query_embedding,
            limit=top_k,
        ).points

        formatted_results = []
        for result in results:
            payload = result.payload or {}
            formatted_results.append(
                {
                    "candidate_id": payload.get("candidate_id", result.id),
                    "name": payload.get("name"),
                    "resume_text": payload.get("resume_text"),
                    "skills": payload.get("skills", []),
                    "experience": payload.get("experience"),
                    "score": result.score,
                }
            )

        return formatted_results

    def get_resume(self, resume_id: int) -> Optional[dict]:
        """Get a specific resume by ID."""
        if self.mock_mode:
            return self._mock_retriever.get_resume(resume_id)
        
        points = self.client.retrieve(collection_name=self.collection_name, ids=[resume_id])

        if points:
            point = points[0]
            payload = point.payload or {}
            return {
                "candidate_id": payload.get("candidate_id", point.id),
                "name": payload.get("name"),
                "resume_text": payload.get("resume_text"),
                "skills": payload.get("skills", []),
                "experience": payload.get("experience"),
            }

        return None

    def ingest_candidate(self, candidate: dict) -> dict:
        """Embed and store a single candidate profile in Qdrant."""
        if self.mock_mode:
            raise RuntimeError("Mock mode does not support ingestion")
        
        candidate_text = candidate.get("resume_text") or candidate.get("content") or ""
        if not candidate_text:
            raise ValueError("candidate must include resume_text or content")

        candidate_id = candidate.get("candidate_id") or candidate.get("id")
        if candidate_id is None:
            raise ValueError("candidate must include candidate_id or id")

        embedding = list(self.model.embed([candidate_text]))[0].tolist()
        payload = {
            "candidate_id": candidate_id,
            "name": candidate.get("name"),
            "resume_text": candidate_text,
            "skills": candidate.get("skills", []),
            "experience": candidate.get("experience"),
        }

        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                PointStruct(
                    id=candidate_id,
                    vector=embedding,
                    payload=payload,
                )
            ],
        )

        return payload
