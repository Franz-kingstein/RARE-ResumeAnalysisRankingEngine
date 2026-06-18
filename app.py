"""Flask application for resume retrieval API."""

from flask import Flask, request, jsonify
from typing import Optional

from storage.qdrant_setup import setup_qdrant
from storage.retrieval import ResumeRetriever


app = Flask(__name__)
retriever: Optional[ResumeRetriever] = None


@app.before_request
def initialize():
    """Initialize retriever on first request."""
    global retriever
    if retriever is None:
        try:
            retriever = ResumeRetriever()
        except Exception as e:
            print(f"Error initializing retriever: {e}")
            print("Make sure Qdrant is running and setup_qdrant() has been executed.")


def get_retriever() -> ResumeRetriever:
    """Return an initialized retriever or raise a clear error."""
    if retriever is None:
        raise RuntimeError("Retriever is not initialized")
    return retriever


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"}), 200


@app.route("/rank", methods=["POST"])
def rank_candidates():
    """
    Rank retrieved candidates against a job description.
    
    Request body:
    {
        "job_description": "machine learning engineer",
        "retrieved_candidates": [...],
        "cutoff_layer": 12,
        "normalize": true
    }
    """
    data = request.get_json()
    
    if not data or "job_description" not in data or "retrieved_candidates" not in data:
        return jsonify({"error": "Missing 'job_description' or 'retrieved_candidates' field"}), 400
    
    job_description = data.get("job_description")
    retrieved_candidates = data.get("retrieved_candidates", [])
    cutoff_layer = int(data.get("cutoff_layer", 12))
    normalize = bool(data.get("normalize", True))
    
    try:
        results = get_retriever().rank_candidates(
            job_description=job_description,
            retrieved_candidates=retrieved_candidates,
            cutoff_layer=cutoff_layer,
            normalize=normalize,
        )
        return jsonify({"ranked_results": results, "job_description": job_description}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/ingest", methods=["POST"])
def ingest_candidate():
    """Ingest a candidate profile into Qdrant."""
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing request body"}), 400

    try:
        stored = get_retriever().ingest_candidate(data)
        return jsonify({"message": "Candidate ingested", "candidate": stored}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/resume/<int:resume_id>", methods=["GET"])
def get_resume(resume_id):
    """Get a specific resume by ID."""
    try:
        resume = get_retriever().get_resume(resume_id)
        if resume:
            return jsonify(resume), 200
        else:
            return jsonify({"error": "Resume not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/setup", methods=["POST"])
def setup():
    """Setup Qdrant and load sample data."""
    try:
        setup_qdrant()
        return jsonify({"message": "Qdrant setup complete"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
