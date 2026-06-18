import unittest
from unittest.mock import MagicMock, patch

from qdrant_client.http.exceptions import UnexpectedResponse

from storage.qdrant_setup import setup_qdrant
from storage.retrieval import ResumeRetriever


class StorageTests(unittest.TestCase):
    @patch("storage.qdrant_setup.QdrantClient")
    @patch("storage.qdrant_setup.TextEmbedding")
    @patch("storage.qdrant_setup.UnexpectedResponse", new=Exception)
    @patch("storage.qdrant_setup.SAMPLE_RESUMES", [
        {
            "id": 1,
            "name": "Alice",
            "content": "Python developer",
            "skills": ["Python"],
            "experience": 3,
        }
    ])
    def test_setup_qdrant_creates_collection_and_loads_points(self, mock_embedding_class, mock_client_class):
        mock_client = MagicMock()
        mock_client.get_collection.side_effect = Exception("missing")
        mock_client_class.return_value = mock_client

        mock_embedding_instance = MagicMock()
        mock_embedding_instance.embed.return_value = [MagicMock(tolist=lambda: [0.1, 0.2, 0.3])]
        mock_embedding_class.return_value = mock_embedding_instance

        setup_qdrant(collection_name="resumes-test", host="localhost", port=6333)

        mock_client.create_collection.assert_called_once()
        mock_client.upsert.assert_called_once()

    @patch("storage.retrieval.QdrantClient")
    @patch("storage.retrieval.TextEmbedding")
    def test_search_returns_ranked_results(self, mock_embedding_class, mock_client_class):
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client

        mock_embedding_instance = MagicMock()
        mock_embedding_instance.embed.side_effect = [
            [MagicMock(tolist=lambda: [1.0, 0.0])],
            [MagicMock(tolist=lambda: [1.0, 0.0])],
            [MagicMock(tolist=lambda: [1.0, 0.0])],
            [MagicMock(tolist=lambda: [0.0, 1.0])],
        ]
        mock_embedding_class.return_value = mock_embedding_instance

        result_one = MagicMock()
        result_one.id = 1
        result_one.score = 0.9
        result_one.payload = {
            "candidate_id": 1,
            "name": "Alice",
            "resume_text": "Python developer",
            "skills": ["Python"],
            "experience": 3,
        }

        result_two = MagicMock()
        result_two.id = 2
        result_two.score = 0.5
        result_two.payload = {
            "candidate_id": 2,
            "name": "Bob",
            "resume_text": "Frontend developer",
            "skills": ["React"],
            "experience": 4,
        }

        mock_client.query_points.return_value.points = [result_one, result_two]

        retriever = ResumeRetriever(collection_name="resumes-test", host="localhost", port=6333)
        results = retriever.search("Python developer", top_k=2)

        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["name"], "Alice")
        self.assertGreaterEqual(results[0]["score"], results[1]["score"])

    @patch("storage.retrieval.QdrantClient")
    @patch("storage.retrieval.TextEmbedding")
    def test_ingest_candidate_stores_payload(self, mock_embedding_class, mock_client_class):
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client

        mock_embedding_instance = MagicMock()
        mock_embedding_instance.embed.return_value = [MagicMock(tolist=lambda: [0.1, 0.2, 0.3])]
        mock_embedding_class.return_value = mock_embedding_instance

        retriever = ResumeRetriever(collection_name="resumes-test", host="localhost", port=6333)
        payload = retriever.ingest_candidate(
            {
                "candidate_id": 99,
                "name": "Sarah",
                "resume_text": "Backend engineer",
                "skills": ["Python", "AWS"],
                "experience": 6,
            }
        )

        mock_client.upsert.assert_called_once()
        self.assertEqual(payload["candidate_id"], 99)
        self.assertEqual(payload["name"], "Sarah")

    @patch("storage.retrieval.QdrantClient")
    @patch("storage.retrieval.TextEmbedding")
    def test_get_resume_returns_payload(self, mock_embedding_class, mock_client_class):
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client

        mock_embedding_instance = MagicMock()
        mock_embedding_instance.embed.return_value = [MagicMock(tolist=lambda: [0.1, 0.2, 0.3])]
        mock_embedding_class.return_value = mock_embedding_instance

        point = MagicMock()
        point.id = 7
        point.payload = {
            "candidate_id": 7,
            "name": "John",
            "resume_text": "Python and AWS",
            "skills": ["Python", "AWS"],
            "experience": 5,
        }
        mock_client.retrieve.return_value = [point]

        retriever = ResumeRetriever(collection_name="resumes-test", host="localhost", port=6333)
        resume = retriever.get_resume(7)

        self.assertEqual(resume["name"], "John")
        self.assertEqual(resume["candidate_id"], 7)


if __name__ == "__main__":
    unittest.main()