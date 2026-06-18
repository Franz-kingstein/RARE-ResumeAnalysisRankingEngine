"""Shared configuration for the storage and retrieval module."""

QDRANT_COLLECTION_NAME = "resumes"
QDRANT_HOST = "localhost"
QDRANT_PORT = 6333

# Use one embedding model everywhere so ingestion and retrieval live in the same vector space.
EMBEDDING_MODEL_NAME = "BAAI/bge-small-en-v1.5"