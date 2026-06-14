"""Flask application for resume retrieval API."""

from flask import Flask, request, jsonify
from retrieval import ResumeRetriever
from qdrant_setup import setup_qdrant


app = Flask(__name__)
retriever = None


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


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"}), 200


@app.route("/search", methods=["POST"])
def search():
    """
    Search for resumes based on query.
    
    Request body:
    {
        "query": "machine learning engineer",
        "top_k": 5
    }
    """
    data = request.get_json()
    
    if not data or "query" not in data:
        return jsonify({"error": "Missing 'query' field"}), 400
    
    query = data.get("query")
    top_k = data.get("top_k", 5)
    
    try:
        results = retriever.search(query, top_k)
        return jsonify({"results": results, "query": query}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/resume/<int:resume_id>", methods=["GET"])
def get_resume(resume_id):
    """Get a specific resume by ID."""
    try:
        resume = retriever.get_resume(resume_id)
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
