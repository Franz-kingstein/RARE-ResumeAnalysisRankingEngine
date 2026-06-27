"""Flask application for resume retrieval API."""

from typing import Optional
import logging

from flask import Flask, jsonify, request

from storage.qdrant_setup import setup_qdrant
from storage.retrieval import ResumeRetriever

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
retriever: Optional[ResumeRetriever] = None


@app.before_request
def initialize():
    global retriever

    if retriever is None:
        try:
            retriever = ResumeRetriever()
            logger.info("ResumeRetriever initialized successfully.")
        except Exception as e:
            logger.exception("Retriever initialization failed.")
            retriever = None


def get_retriever():
    if retriever is None:
        raise RuntimeError(
            "Retriever not initialized. Make sure Qdrant is running and setup_qdrant() has been executed."
        )
    return retriever


@app.route("/health", methods=["GET"])
def health():
    if retriever is None:
        return (
            jsonify(
                {
                    "status": "degraded",
                    "retriever_ready": False,
                }
            ),
            503,
        )

    return jsonify(
        {
            "status": "ok",
            "retriever_ready": True,
        }
    )


@app.route("/search", methods=["POST"])
def search():

    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    query = str(data.get("query", "")).strip()

    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400

    try:
        top_k = int(data.get("top_k", 5))
    except (TypeError, ValueError):
        return jsonify({"error": "top_k must be an integer"}), 400

    top_k = max(1, min(top_k, 100))

    search_type = data.get("search_type", "hybrid").lower()

    if search_type not in {"vector", "keyword", "hybrid"}:
        return jsonify(
            {
                "error": "search_type must be one of: vector, keyword, hybrid"
            }
        ), 400

    try:
        results = get_retriever().search(
            query=query,
            top_k=top_k,
            search_type=search_type,
        )

        return jsonify(
            {
                "query": query,
                "search_type": search_type,
                "results": results,
            }
        )

    except Exception as e:
        logger.exception("Search failed.")
        return jsonify({"error": str(e)}), 500


@app.route("/ingest", methods=["POST"])
def ingest_candidate():

    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing request body"}), 400

    try:
        payload = get_retriever().ingest_candidate(data)

        return (
            jsonify(
                {
                    "message": "Candidate ingested successfully",
                    "candidate": payload,
                }
            ),
            201,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        logger.exception("Candidate ingestion failed.")
        return jsonify({"error": str(e)}), 500


@app.route("/resume/<int:resume_id>", methods=["GET"])
def get_resume(resume_id):

    try:
        resume = get_retriever().get_resume(resume_id)

        if resume is None:
            return jsonify({"error": "Resume not found"}), 404

        return jsonify(resume)

    except Exception as e:
        logger.exception("Resume retrieval failed.")
        return jsonify({"error": str(e)}), 500


@app.route("/setup", methods=["POST"])
def setup():

    try:
        setup_qdrant()
        return jsonify({"message": "Qdrant setup complete"})

    except Exception as e:
        logger.exception("Setup failed.")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)