"""Storage and retrieval layer for candidate ingestion and vector search."""

from .config import (
    EMBEDDING_MODEL_NAME,
    QDRANT_COLLECTION_NAME,
    QDRANT_HOST,
    QDRANT_PORT,
)
from .qdrant_setup import setup_qdrant
from .retrieval import ResumeRetriever

__all__ = [
    "EMBEDDING_MODEL_NAME",
    "QDRANT_COLLECTION_NAME",
    "QDRANT_HOST",
    "QDRANT_PORT",
    "ResumeRetriever",
    "setup_qdrant",
]
