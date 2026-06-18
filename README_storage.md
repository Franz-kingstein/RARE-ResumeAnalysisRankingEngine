# Storage & Retrieval Module

This repository contains the storage side of the resume ranking pipeline.
It is the part responsible for:

- creating the Qdrant collection
- seeding sample resumes
- ingesting new candidate profiles
- retrieving stored resumes by ID
- returning semantic matches for a job description

The ranking engine is separate. If you are working on ranking, you only need the data returned by this storage layer.

## Files in this part

- `storage/__init__.py` exposes the public API
- `storage/config.py` stores Qdrant host, port, collection name, and embedding model
- `storage/qdrant_setup.py` creates the collection and loads sample resumes
- `storage/retrieval.py` contains search, ingest, and fetch logic
- `storage/sample_resumes.py` contains sample data used for seeding
- `app.py` exposes Flask endpoints for setup, search, ingest, and resume lookup

## Public API

Import from `storage`:

```python
from storage import setup_qdrant, ResumeRetriever
```

### `setup_qdrant()`

One-time initialization. It creates the Qdrant collection if it does not already exist and loads the sample resumes.

### `ResumeRetriever()`

Creates a retriever connected to Qdrant using the config values in `storage/config.py`.

## Typical workflow

### 1. Initialize Qdrant

```python
from storage import setup_qdrant

setup_qdrant()
```

### 2. Create the retriever

```python
from storage import ResumeRetriever

retriever = ResumeRetriever()
```

### 3. Search for candidates

```python
query = "Looking for Python developer with AWS experience"
results = retriever.search(query, top_k=5)

for result in results:
    print(result["name"])
    print(result["skills"])
    print(result["score"])
```

### 4. Ingest a new candidate

```python
new_candidate = {
    "candidate_id": 6,
    "name": "John Developer",
    "resume_text": "Full Stack Engineer with 8 years in Python, AWS, Docker, and Kubernetes",
    "skills": ["Python", "AWS", "Docker", "Kubernetes"],
    "experience": 8,
}

retriever.ingest_candidate(new_candidate)
```

### 5. Retrieve a stored resume

```python
resume = retriever.get_resume(resume_id=1)
print(resume)
```

## Data contract

The storage layer expects candidate records to include:

- `candidate_id` or `id`
- `name`
- `resume_text` or `content`

Optional fields:

- `skills`
- `experience`

The search output returns:

- `candidate_id`
- `name`
- `resume_text`
- `skills`
- `experience`
- `score`

## For the ranking teammate

Use the list returned by `retriever.search(...)` as input to the ranking stage.

Recommended flow:

```python
from storage import setup_qdrant, ResumeRetriever

setup_qdrant()
retriever = ResumeRetriever()

job_description = "Python backend engineer with microservices experience"
candidates = retriever.search(job_description, top_k=3)

# Send `candidates` to the ranking module
```

Important notes for ranking:

- The storage layer already returns normalized candidate dictionaries.
- `score` here is the semantic search score from Qdrant.
- The ranking engine can safely reorder or rerank the returned candidates.

## Flask endpoints

If you want to use the HTTP API in `app.py`:

- `POST /setup` initializes Qdrant and seeds sample data
- `POST /rank` reranks retrieved candidates against a job description
- `POST /ingest` stores a new candidate
- `GET /resume/<id>` fetches one candidate by ID
- `GET /health` returns a health check response

## Local setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Then start Qdrant and run:

```bash
python -c "from storage import setup_qdrant; setup_qdrant()"
```

## What to change if needed

If Qdrant runs on a different host or port, update `storage/config.py`.

If you want different embeddings, change `EMBEDDING_MODEL_NAME` in `storage/config.py`, but keep the same model for ingestion and retrieval.