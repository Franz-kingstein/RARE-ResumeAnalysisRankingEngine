"""Resume retrieval logic using vector similarity search."""

from typing import Optional

from fastembed import TextEmbedding
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

from storage.config import (
    EMBEDDING_MODEL_NAME,
    QDRANT_COLLECTION_NAME,
    QDRANT_HOST,
    QDRANT_PORT,
)


class ResumeRetriever:
    """Handles resume search and retrieval using vector embeddings."""

    def __init__(
        self,
        collection_name=QDRANT_COLLECTION_NAME,
        host=QDRANT_HOST,
        port=QDRANT_PORT,
    ):
        self.client = QdrantClient(host=host, port=port)
        self.model = TextEmbedding(model_name=EMBEDDING_MODEL_NAME)
        self.collection_name = collection_name

    def search(self, query: str, top_k: int = 5) -> list:
        """Search for resumes similar to the query."""
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
