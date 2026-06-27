# Hiring AI Brain - Resume/ATS Reranking Module

This repository contains the high-performance **Layerwise Candidate Reranking Module** (`ranking`) designed for resume screening and Applicant Tracking Systems (ATS). It sits downstream of your team's upstream parsing, embedding, and vector database retrieval pipeline.

---

## 📂 Project Directory Structure

```
RARE-ResumeAnalysisRankingEngine/
│
├── ranking/                     <-- Core module package
│   ├── __init__.py              <-- Exposes importable classes and schemas
│   ├── layerwise_engine.py      <-- Core early-exit LLM Reranker implementation
│   └── schemas.py               <-- Pydantic v2 data validation schemas
│
├── ranking_test/                <-- Test suite folder
│   └── test_layerwise_engine.py <-- pytest mock and validation tests
│
├── storage/                     <-- Storage & Retrieval Module
│   ├── __init__.py
│   ├── config.py                <-- Configuration (vector/keyword weights)
│   ├── qdrant_setup.py          <-- Qdrant collection setup
│   ├── retrieval.py             <-- ResumeRetriever with hybrid search
│   └── sample_resumes.py        <-- Sample data for testing
│
├── app.py                       <-- Flask API for storage endpoints
├── test_storage.py              <-- Storage module tests
├── main.py                      <-- E2E demonstration/integration script
├── pipeline_integration.py      <-- Integration pipeline script
├── benchmark_integration.py     <-- Benchmarking script
├── requirements.txt             <-- Package dependencies
└── README.md                    <-- This documentation
```

---

## 🎯 Key Design & Architectural Highlights

When presenting or pitching this reranker, highlight these critical engineering angles:

1. **Decoupled Architecture**: 
   The engine is packaged as an independent Python module (`ranking`). Upstream parsing and vector retrieval logic can change entirely without affecting the reranker. Teammates import the reranker via simple statements:
    ```python
    from ranking import LayerwiseCandidateReranker
    ```

2. **VRAM Conservation (GPU Optimization)**:
   By wrapping the reranker in a class, the underlying deep learning model (`BAAI/bge-reranker-v2-minicpm-layerwise`) is initialized **once** during `__init__` and pinned in memory. This prevents memory leaks, fragmentation, and slow startup times caused by re-instantiating heavy weights during active searches.

3. **Dynamic Efficiency Core (Early-Exit Processing)**:
   The `cutoff_layer` parameter lets you trade model latency for accuracy in real-time. By leveraging early-exit layers (e.g., using layer `12` for preliminary filtering or layer `40` for final sorting), you can adjust compute requirements to match query volumes.

4. **Pydantic Validation**:
   The module uses Pydantic schemas to validate records arriving from the vector database before they trigger neural inference, providing clear, early error messages when incorrect schemas are passed. Extra fields are tolerated (`ConfigDict(extra="allow")`) so upstream database schema adjustments won't break the ranking layer.

5. **Local Simulation Fallback**:
   To make local development and test automation environment-agnostic, the class supports a robust **Simulation Mode**. If `torch` or `FlagEmbedding` dependencies are missing, or if GPU out-of-memory errors occur, the module gracefully falls back to a high-fidelity keyword and synonym matching engine (e.g. matching `golang` $\rightarrow$ `go` and `k8s` $\rightarrow$ `kubernetes`) to generate realistic rankings without loading heavy models.

---

## 🚀 Setup & Run Instructions

Follow these steps to run the pipeline demo or verify the package locally:

### 1. Create a Python Virtual Environment
Initialize a virtual environment to keep your workspace isolated:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies
Install validation, test runner, and model dependencies:
```bash
pip install -r requirements.txt
```

### 3. Run the Demonstration Pipeline
Execute the main script to see the reranker process simulated Vector DB results and produce a ranked shortlist:
```bash
PYTHONPATH=. python3 main.py
```

### 4. Run the Automated Test Suite (Ranking)
Run the suite of industry-standard `pytest` unit tests (verifies schema validation, sorting logic, early exit configuration, empty state boundaries, and mocked neural pathways):
```bash
PYTHONPATH=. pytest ranking_test/
```

### 5. Run Storage Tests
Run the storage module tests (verifies Qdrant integration, hybrid search, embedding generation):
```bash
PYTHONPATH=. pytest test_storage.py -v
```

---

## 🗄 Storage & Retrieval Module

This repository includes a storage layer under `storage/` that:

- accepts candidate text or structured profile payloads
- generates embeddings with FastEmbed
- stores candidate vectors and metadata in Qdrant
- retrieves top matches for a job description
- returns ranking-ready candidate payloads

### Storage API

- `POST /setup` seeds the Qdrant collection with sample data
- `POST /ingest` stores a candidate profile
- `POST /search` returns semantic matches for a job description (supports vector, keyword, and hybrid search)
- `GET /resume/<id>` retrieves one stored candidate by ID
- `GET /health` health check endpoint

### Hybrid Search

The storage module supports three search modes:

| Mode | Description |
|------|-------------|
| `vector` | Semantic similarity search using embeddings |
| `keyword` | Exact keyword matching using indexed payload fields |
| `hybrid` | Combines semantic and keyword search with configurable weighted ranking (default: 70% vector, 30% keyword) |

See `README_storage.md` for detailed usage examples.

---

## 💻 Integration Code Snippet
To use the module inside the team's main pipeline script:

```python
from ranking import LayerwiseCandidateReranker

# Initialize engine (loads model onto GPU once)
reranker = LayerwiseCandidateReranker()

# List of candidates retrieved from upstream Vector DB
candidates = [
    {"id": 101, "name": "Alice", "skills": "Go, Docker", "resume_text": "..."},
    {"id": 102, "name": "Bob", "skills": "React, HTML", "resume_text": "..."}
]

# Run reranking using cutoff layer 12 for ultra-fast processing
ranked_shortlist = reranker.rank_candidates(
    job_description="Go Backend Developer with Docker knowledge",
    retrieved_candidates=candidates,
    cutoff_layer=12
)

for rank, cand in enumerate(ranked_shortlist, start=1):
    print(f"Rank {rank}: {cand['name']} | Score: {cand['ai_match_score']:.4f}")
```
