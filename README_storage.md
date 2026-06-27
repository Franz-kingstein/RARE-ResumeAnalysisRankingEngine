# Storage & Retrieval Module

## Overview

This module is responsible for storing, retrieving, and ranking candidate resumes using **Qdrant Vector Database** and **FastEmbed** embeddings.

It supports three search modes:

* **Vector Search** – Semantic similarity search using embeddings.
* **Keyword Search** – Exact keyword matching using indexed payload fields.
* **Hybrid Search** – Combines semantic and keyword search with configurable weighted ranking.

---

# Architecture

```
Resume
   │
   ▼
FastEmbed Embedding
   │
   ▼
Qdrant Vector Database
   │
   ├───────────────► Vector Search
   │
   ├───────────────► Keyword Search
   │
   ▼
Merge Results
   │
Normalize Scores
   │
Weighted Ranking
   │
   ▼
Top-K Candidates
```

---

# Project Structure

```
storage/
│
├── __init__.py
├── config.py
├── qdrant_setup.py
└── retrieval.py

app.py
test_storage.py
requirements.txt
```

---

# Features

## Resume Ingestion

Each resume is embedded using FastEmbed and stored in Qdrant with metadata.

Stored payload:

```python
{
    "candidate_id": 1,
    "name": "John Doe",
    "resume_text": "...",
    "skills": ["Python", "AWS"],
    "experience": 5
}
```

---

## Vector Search

Uses semantic similarity between the query embedding and stored resume embeddings.

Suitable for:

* Similar skills
* Similar experience
* Semantic matching
* Different wording with similar meaning

Example:

```
Query:
Python Backend Engineer
```

Matches:

```
Python Developer
Software Engineer
Backend API Developer
```

---

## Keyword Search

Uses Qdrant payload indexes.

Indexed fields:

* resume_text
* skills

Suitable for:

* Exact skill matching
* Technology search
* Certification search

Example:

```
Query:
AWS Docker
```

Returns resumes explicitly containing those keywords.

---

## Hybrid Search

Hybrid Search combines:

* Vector Search
* Keyword Search

Pipeline:

```
Query
   │
   ├────────► Vector Search
   │
   ├────────► Keyword Search
   │
Merge Results
   │
Normalize Scores
   │
Weighted Ranking
   │
Return Top-K
```

---

# Ranking Formula

```
Final Score =
(Vector Score × VECTOR_WEIGHT)
+
(Keyword Score × KEYWORD_WEIGHT)
```

Default configuration:

```
VECTOR_WEIGHT = 0.7
KEYWORD_WEIGHT = 0.3
```

Weights can be changed in:

```
storage/config.py
```

---

# Configuration

```
QDRANT_HOST

QDRANT_PORT

QDRANT_COLLECTION_NAME

EMBEDDING_MODEL_NAME

VECTOR_WEIGHT

KEYWORD_WEIGHT

OVERFETCH_FACTOR
```

---

# Setting up Qdrant

Start Qdrant (Docker):

```bash
docker run -p 6333:6333 qdrant/qdrant
```

Initialize the collection:

```python
from storage.qdrant_setup import setup_qdrant

setup_qdrant()
```

This creates:

* Vector collection
* Payload indexes
* Required metadata fields

---

# Resume Ingestion

```python
from storage.retrieval import ResumeRetriever

retriever = ResumeRetriever()

retriever.ingest_candidate(
    {
        "candidate_id": 1,
        "name": "Alice",
        "resume_text": "Python FastAPI AWS Docker",
        "skills": ["Python", "AWS"],
        "experience": 5
    }
)
```

---

# Search Examples

## Vector Search

```python
results = retriever.search(
    query="Python Backend Engineer",
    search_type="vector",
    top_k=5
)
```

---

## Keyword Search

```python
results = retriever.search(
    query="AWS Docker",
    search_type="keyword",
    top_k=5
)
```

---

## Hybrid Search

```python
results = retriever.search(
    query="Python AWS Developer",
    search_type="hybrid",
    top_k=5
)
```

---

# API Endpoints

## Search

```
POST /search
```

Example request:

```json
{
    "query": "Python Backend Engineer",
    "search_type": "hybrid",
    "top_k": 5
}
```

---

## Ingest Resume

```
POST /ingest
```

---

## Get Resume

```
GET /resume/<candidate_id>
```

---

## Health Check

```
GET /health
```

---

# Running Tests

Run all storage tests:

```bash
python3 -m pytest test_storage.py -v
```

Expected result:

```
24 passed
```

---

# Current Implementation

Implemented:

* Resume ingestion
* FastEmbed embeddings
* Qdrant storage
* Vector Search
* Keyword Search
* Hybrid Search
* Candidate deduplication
* Score normalization
* Weighted ranking
* Payload indexing
* Configurable weights
* Flask API integration
* Comprehensive unit tests

---

# Performance Notes

Current implementation uses:

* FastEmbed for lightweight embedding generation
* Qdrant for vector indexing
* Payload indexes for keyword filtering
* Weighted ranking for hybrid retrieval

---

# Future Improvements

Potential enhancements include:

* Native Qdrant Hybrid Search (Dense + Sparse Vectors)
* BM25 or SPLADE sparse embeddings
* Cross-Encoder reranking
* Query expansion
* Phrase-level keyword matching
* Synonym handling
* Search result caching
* Batch resume ingestion
* Async retrieval

---

# Module Owner

Storage & Retrieval Module

Responsibilities:

* Resume ingestion
* Vector database management
* Candidate retrieval
* Hybrid search implementation
* Ranking pipeline
* Qdrant integration
* Storage testing
