"""Setup script for Qdrant vector database."""

from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from qdrant_client.models import Distance, PointStruct, VectorParams
from fastembed import TextEmbedding

from storage.config import (
    EMBEDDING_MODEL_NAME,
    QDRANT_COLLECTION_NAME,
    QDRANT_HOST,
    QDRANT_PORT,
)
from storage.sample_resumes import SAMPLE_RESUMES


def setup_qdrant(
    collection_name=QDRANT_COLLECTION_NAME,
    host=QDRANT_HOST,
    port=QDRANT_PORT,
):
    """Initialize Qdrant collection and load sample resumes."""
    client = QdrantClient(host=host, port=port)
    model = TextEmbedding(model_name=EMBEDDING_MODEL_NAME)

    try:
        client.get_collection(collection_name=collection_name)
        collection_exists = True
    except UnexpectedResponse:
        collection_exists = False

    if not collection_exists:
        sample_embedding = list(model.embed(["test"]))[0]
        embedding_dimension = len(sample_embedding)

        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=embedding_dimension,
                distance=Distance.COSINE,
            ),
        )

        print(f"Created collection: {collection_name}")
    else:
        print(f"Collection already exists: {collection_name}")

    points = []
    for resume in SAMPLE_RESUMES:
        embedding = list(model.embed([resume["content"]]))[0].tolist()

        payload = {
            "candidate_id": resume["id"],
            "name": resume["name"],
            "resume_text": resume["content"],
        }

        if "skills" in resume:
            payload["skills"] = resume["skills"]

        if "experience" in resume:
            payload["experience"] = resume["experience"]

        points.append(
            PointStruct(
                id=resume["id"],
                vector=embedding,
                payload=payload,
            )
        )

    client.upsert(collection_name=collection_name, points=points)
    print(f"Loaded {len(points)} resumes into Qdrant")
    return client


if __name__ == "__main__":
    setup_qdrant()
    print("Qdrant setup complete!")