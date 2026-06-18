"""Resume retrieval and ranking logic using vector embeddings."""

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
    """Handles resume retrieval, ingestion, and candidate ranking."""

    def __init__(
        self,
        collection_name=QDRANT_COLLECTION_NAME,
        host=QDRANT_HOST,
        port=QDRANT_PORT,
    ):
        self.client = QdrantClient(host=host, port=port)
        self.model = TextEmbedding(model_name=EMBEDDING_MODEL_NAME)
        self.collection_name = collection_name

    def rank_candidates(
        self,
        job_description: str,
        retrieved_candidates: list,
        cutoff_layer: int = 12,
        normalize: bool = True,
    ) -> list:
        """Rank retrieved candidates against a job description."""
        if not job_description:
            raise ValueError("job_description is required")

        if not retrieved_candidates:
            return []

        query_embedding = list(self.model.embed([job_description]))[0].tolist()
        ranked_results = []

        for candidate in retrieved_candidates:
            candidate_text = candidate.get("resume_text") or candidate.get("content") or ""
            if not candidate_text:
                continue

            candidate_embedding = list(self.model.embed([candidate_text]))[0].tolist()
            score = sum(a * b for a, b in zip(query_embedding, candidate_embedding))

            ranked_results.append(
                {
                    "candidate_id": candidate.get("candidate_id") or candidate.get("id"),
                    "name": candidate.get("name"),
                    "resume_text": candidate_text,
                    "skills": candidate.get("skills", []),
                    "experience": candidate.get("experience"),
                    "score": score,
                }
            )

        ranked_results.sort(key=lambda item: item["score"], reverse=True)
        ranked_results = ranked_results[:cutoff_layer]

        if normalize and ranked_results:
            scores = [item["score"] for item in ranked_results]
            min_score = min(scores)
            max_score = max(scores)

            if max_score != min_score:
                for item in ranked_results:
                    item["score"] = (item["score"] - min_score) / (max_score - min_score)
            else:
                for item in ranked_results:
                    item["score"] = 1.0

        return ranked_results

    def search(self, query: str, top_k: int = 5) -> list:
        """Backward-compatible wrapper around rank_candidates."""
        query_embedding = list(self.model.embed([query]))[0].tolist()

        results = self.client.query_points(
            collection_name=self.collection_name,
            query=query_embedding,
            limit=top_k,
        ).points

        retrieved_candidates = []
        for result in results:
            payload = result.payload or {}
            retrieved_candidates.append(
                {
                    "candidate_id": payload.get("candidate_id", result.id),
                    "name": payload.get("name"),
                    "resume_text": payload.get("resume_text"),
                    "skills": payload.get("skills", []),
                    "experience": payload.get("experience"),
                }
            )

        return self.rank_candidates(
            job_description=query,
            retrieved_candidates=retrieved_candidates,
            cutoff_layer=top_k,
            normalize=True,
        )

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