"""Setup script for Qdrant vector database."""

from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from qdrant_client.models import Distance, VectorParams
from fastembed import TextEmbedding

from storage.config import (
    EMBEDDING_MODEL_NAME,
    QDRANT_COLLECTION_NAME,
    QDRANT_HOST,
    QDRANT_PORT,
)


def setup_qdrant(
    collection_name=QDRANT_COLLECTION_NAME,
    host=QDRANT_HOST,
    port=QDRANT_PORT,
):
    """Initialize Qdrant collection (creates empty collection)."""
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

        print(f"✓ Created collection: {collection_name}")
    else:
        print(f"✓ Collection already exists: {collection_name}")

    return client


if __name__ == "__main__":
    setup_qdrant()
    print("Qdrant setup complete!")