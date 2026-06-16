import sys
from ranking import LayerwiseCandidateReranker

def main():
    print("=" * 60)
    print("         ATS CANDIDATE RERANKING ENGINE DEMO")
    print("=" * 60)

    # 1. Simulate the upstream search query (Job Description)
    job_desc = "Looking for a Go Backend Developer with Kubernetes expertise."
    print(f"[INPUT] Job Description: '{job_desc}'")

    # 2. Simulate upstream retrieval (e.g., Vector DB Similarity Search yields these candidates)
    retrieved_candidates = [
        {
            "id": 101, 
            "name": "Alice", 
            "skills": "Golang, Docker, K8s, Microservices", 
            "resume_text": "Built cloud backend systems with Go and Kubernetes. Automated Docker build containers."
        },
        {
            "id": 102, 
            "name": "Bob", 
            "skills": "React, CSS, HTML, TypeScript", 
            "resume_text": "Frontend designer portfolio containing clean pixel-perfect components using Tailwind, React and HTML."
        },
        {
            "id": 103, 
            "name": "Charlie", 
            "skills": "Python, Django, AWS, Kubernetes", 
            "resume_text": "Backend engineer with experience in Django, PostgreSQL and Docker. Managed some AWS EKS services."
        },
    ]
    print(f"[INPUT] Retrieved {len(retrieved_candidates)} mock candidates from Vector DB retrieval step.")

    # 3. Initialize the custom ranking engine
    # (Reads GPU setup and model weights once; automatically falls back to simulation mode if deps are missing)
    print("\n[INFO] Initializing Candidate Reranker...")
    reranker = LayerwiseCandidateReranker()
    print(f"[INFO] Engine Mode: {'SIMULATION' if reranker.simulation_mode else 'NEURAL INFERENCE (GPU/CPU)'}")

    # 4. Execute the layerwise reranker pass (cutoff_layer=12 for fast processing)
    print("\n[INFO] Running ranking engine...")
    ranked_candidates = reranker.rank_candidates(
        job_description=job_desc,
        retrieved_candidates=retrieved_candidates,
        cutoff_layer=12
    )

    # 5. Output results
    print("\n" + "=" * 60)
    print("                   FINAL RANKED SHORTLIST")
    print("=" * 60)
    for rank, candidate in enumerate(ranked_candidates, start=1):
        print(f"Rank {rank}: {candidate['name']} (ID: {candidate['id']})")
        print(f"  AI Match Score : {candidate['ai_match_score']:.4f}")
        print(f"  Core Skills    : {candidate['skills']}")
        print(f"  Summary        : {candidate['resume_text'][:70]}...")
        print("-" * 60)

if __name__ == "__main__":
    main()
