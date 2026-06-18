# Storage & Retrieval Module

This module provides the storage and retrieval layer for a resume ranking pipeline. It handles semantic search using vector embeddings with Qdrant as the vector database.

## What it does

- Creates and manages a Qdrant vector collection for resumes
- Seeds the collection with sample resumes
- Ingests new candidate profiles with embeddings
- Retrieves resumes by ID
- Searches for candidates matching a job description using semantic similarity
- Ranks retrieved candidates against job descriptions

**Note:** The ranking engine is separate. If you're working on ranking, you only need the data returned by this storage layer.

---

## Project Structure

```
storage/
├── __init__.py           # Exposes public API (setup_qdrant, ResumeRetriever)
├── config.py             # Configuration (Qdrant host, port, collection name, embedding model)
├── qdrant_setup.py       # Initializes Qdrant collection and loads sample resumes
├── retrieval.py          # Core logic: search, ingest, fetch, and ranking
└── sample_resumes.py     # Sample candidate data for seeding

app.py                     # Flask API endpoints (optional, for HTTP interface)
test_storage.py           # Unit tests for storage and retrieval
requirements.txt          # Python dependencies
```

---

## Setup & Installation

### Prerequisites

- Python 3.8+
- Qdrant server running (default: `localhost:6333`)

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Start Qdrant

If you don't have Qdrant running locally:

```bash
docker run -d -p 6333:6333 qdrant/qdrant
```

Or follow the [Qdrant documentation](https://qdrant.tech/documentation/quick-start/) for other installation methods.

### 3. Initialize the collection (one-time)

```python
from storage import setup_qdrant

setup_qdrant()  # Creates collection and loads sample resumes
print("✓ Qdrant collection initialized with sample resumes")
```

---

## Usage

### Quick Start

```python
from storage import setup_qdrant, ResumeRetriever

# Initialize (first time only)
setup_qdrant()

# Create a retriever
retriever = ResumeRetriever()

# Search for candidates
job_desc = "Python developer with AWS experience"
results = retriever.search(job_desc, top_k=5)

for candidate in results:
    print(f"{candidate['name']}: {candidate['score']:.2f}")
    print(f"  Skills: {candidate['skills']}")
    print()
```

### API Reference

#### `setup_qdrant(collection_name=None, host=None, port=None)`

Initializes the Qdrant collection and seeds it with sample resumes.

**Parameters:**
- `collection_name`: Collection name (default: `"resumes"` from config)
- `host`: Qdrant host (default: `"localhost"` from config)
- `port`: Qdrant port (default: `6333` from config)

**Returns:** Qdrant client instance

**Example:**
```python
from storage import setup_qdrant

setup_qdrant()
```

---

#### `ResumeRetriever(collection_name=None, host=None, port=None)`

Creates a retriever instance connected to Qdrant.

**Parameters:**
- `collection_name`: Collection name (default: from config)
- `host`: Qdrant host (default: from config)
- `port`: Qdrant port (default: from config)

**Methods:**

##### `search(query: str, top_k: int = 5) -> list`

Searches for candidates matching a job description using semantic similarity.

**Parameters:**
- `query`: Job description or search query
- `top_k`: Number of top results to return (default: 5)

**Returns:** List of ranked candidates with fields:
- `candidate_id`: Candidate ID
- `name`: Candidate name
- `resume_text`: Full resume text
- `skills`: List of skills
- `experience`: Years of experience
- `score`: Relevance score (0.0-1.0 when normalized)

**Example:**
```python
retriever = ResumeRetriever()
results = retriever.search("Python developer with AWS experience", top_k=10)
```

---

##### `ingest_candidate(candidate: dict) -> dict`

Embeds and stores a new candidate in the collection.

**Parameters:**
- `candidate`: Dict with fields:
  - `candidate_id` or `id` (required)
  - `name` (required)
  - `resume_text` or `content` (required)
  - `skills` (optional): List of skills
  - `experience` (optional): Years of experience

**Returns:** Stored candidate payload

**Example:**
```python
new_candidate = {
    "candidate_id": 100,
    "name": "Alice Chen",
    "resume_text": "8 years Python, AWS, Kubernetes, and Docker",
    "skills": ["Python", "AWS", "Kubernetes", "Docker"],
    "experience": 8,
}
retriever.ingest_candidate(new_candidate)
```

---

##### `get_resume(resume_id: int) -> dict | None`

Retrieves a specific resume by ID.

**Parameters:**
- `resume_id`: ID of the resume to retrieve

**Returns:** Resume payload or `None` if not found

**Example:**
```python
resume = retriever.get_resume(1)
if resume:
    print(f"{resume['name']}: {resume['resume_text']}")
```

---

##### `rank_candidates(job_description: str, retrieved_candidates: list, cutoff_layer: int = 12, normalize: bool = True) -> list`

Ranks a list of candidates against a job description using semantic similarity.

**Parameters:**
- `job_description`: Job description or requirements
- `retrieved_candidates`: List of candidate dicts with `resume_text` or `content`
- `cutoff_layer`: Max number of results (default: 12)
- `normalize`: Normalize scores to 0.0-1.0 range (default: True)

**Returns:** Sorted list of ranked candidates

---

## Configuration

Edit `storage/config.py` to customize:

```python
QDRANT_COLLECTION_NAME = "resumes"  # Collection name in Qdrant
QDRANT_HOST = "localhost"            # Qdrant server host
QDRANT_PORT = 6333                   # Qdrant server port
EMBEDDING_MODEL_NAME = "BAAI/bge-small-en-v1.5"  # Embedding model
```

---

## Running Tests

```bash
python -m pytest test_storage.py -v
```

Or with unittest:

```bash
python -m unittest test_storage.py
```

**Test Coverage:**
- `test_setup_qdrant_creates_collection_and_loads_points`: Verifies collection creation and sample resume loading
- `test_search_returns_ranked_results`: Verifies search functionality and result ranking
- `test_ingest_candidate_stores_payload`: Verifies new candidate ingestion
- `test_get_resume_returns_payload`: Verifies resume retrieval by ID

---

## Data Format

### Candidate Record

Candidates must include:

**Required fields:**
- `candidate_id` (or `id`): Unique identifier
- `name`: Candidate's name
- `resume_text` (or `content`): Resume or profile text for embedding

**Optional fields:**
- `skills`: List of skills (e.g., `["Python", "AWS"]`)
- `experience`: Years of experience (integer)

### Search Result

Results from `search()` include:

```python
{
    "candidate_id": 1,
    "name": "Alice",
    "resume_text": "Python developer with AWS experience",
    "skills": ["Python", "AWS"],
    "experience": 5,
    "score": 0.95  # Similarity score (0.0-1.0)
}
```

---

## Troubleshooting

### "Connection refused" when creating `ResumeRetriever`

**Problem:** Qdrant server is not running or not accessible.

**Solution:**
1. Start Qdrant: `docker run -d -p 6333:6333 qdrant/qdrant`
2. Verify connection: `docker ps | grep qdrant`
3. Check custom host/port if needed

### "Collection already exists" warning

**Problem:** Trying to initialize a collection that already exists.

**Solution:** This is normal behavior. The setup checks if the collection exists and skips creation if it does. Just proceed with using `ResumeRetriever`.

### Low search scores

**Problem:** Search results have unexpectedly low relevance scores.

**Solutions:**
1. Verify the embedding model is correct in `config.py`
2. Check that resumes have sufficient content (short text = lower quality embeddings)
3. Ensure `normalize=True` in search calls for 0.0-1.0 scale

### "ModuleNotFoundError: No module named 'storage'"

**Problem:** Running scripts outside the project root.

**Solution:** Ensure you're running from the project root and that `storage/` is a proper Python package with `__init__.py`

---

## Development Notes

- The embedding model (`BAAI/bge-small-en-v1.5`) is loaded on first use and cached. First search may be slow.
- All searches are normalized to 0.0-1.0 scale by default for consistency.
- The `rank_candidates` method implements semantic similarity ranking and is used internally by `search()`.

---

## Flask API (Optional)

If you want to expose this as HTTP endpoints, run:

```bash
python app.py
```

Available endpoints:
- `GET /health` - Health check
- (Additional endpoints may be defined in `app.py`)
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