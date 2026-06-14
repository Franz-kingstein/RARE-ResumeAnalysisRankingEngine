"""Resume retrieval logic using vector similarity search."""

from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer


class ResumeRetriever:
    """Handles resume search and retrieval using vector embeddings."""
    
    def __init__(self, collection_name="resumes", host="localhost", port=6333):
        """
        Initialize the retriever with Qdrant client and embedding model.
        
        Args:
            collection_name (str): Name of the Qdrant collection
            host (str): Qdrant server host
            port (int): Qdrant server port
        """
        self.client = QdrantClient(host=host, port=port)
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.collection_name = collection_name
    
    def search(self, query: str, top_k: int = 5) -> list:
        """
        Search for resumes similar to the query.
        
        Args:
            query (str): Search query
            top_k (int): Number of top results to return
            
        Returns:
            list: List of matching resumes with scores
        """
        # Encode query
        query_embedding = self.model.encode(query).tolist()
        
        # Search in Qdrant
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding,
            limit=top_k
        )
        
        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append({
                "id": result.id,
                "name": result.payload.get("name"),
                "content": result.payload.get("content"),
                "score": result.score
            })
        
        return formatted_results
    
    def get_resume(self, resume_id: int) -> dict:
        """
        Get a specific resume by ID.
        
        Args:
            resume_id (int): Resume ID
            
        Returns:
            dict: Resume data
        """
        points = self.client.retrieve(
            collection_name=self.collection_name,
            ids=[resume_id]
        )
        
        if points:
            point = points[0]
            return {
                "id": point.id,
                "name": point.payload.get("name"),
                "content": point.payload.get("content")
            }
        
        return None
