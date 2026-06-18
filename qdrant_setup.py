"""Setup script for Qdrant vector database."""

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from fastembed import TextEmbedding
from sample_resumes import SAMPLE_RESUMES


def setup_qdrant(collection_name="resumes", host="localhost", port=6333):
    """
    Initialize Qdrant collection and load sample resumes.
    """

    # Initialize Qdrant client
    client = QdrantClient(host=host, port=port)

    # Initialize FastEmbed model
    model = TextEmbedding()

    # Delete existing collection if it exists
    try:
        client.delete_collection(collection_name=collection_name)
        print(f"Deleted existing collection: {collection_name}")
    except Exception as e:
        print(f"Collection does not exist or error: {e}")

    # Generate one sample embedding to get vector size
    sample_embedding = list(model.embed(["test"]))[0]
    embedding_dimension = len(sample_embedding)

    # Create collection
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(
            size=embedding_dimension,
            distance=Distance.COSINE
        )
    )

    print(f"Created collection: {collection_name}")

    # Encode resumes and upload to Qdrant
    points = []

    for resume in SAMPLE_RESUMES:

        embedding = list(
            model.embed([resume["content"]])
        )[0].tolist()

        point = PointStruct(
            id=resume["id"],
            vector=embedding,
            payload={
                "name": resume["name"],
                "content": resume["content"]
            }
        )

        points.append(point)

    client.upsert(
        collection_name=collection_name,
        points=points
    )

    print(f"Loaded {len(points)} resumes into Qdrant")

    return client


if __name__ == "__main__":
    setup_qdrant()
    print("Qdrant setup complete!")