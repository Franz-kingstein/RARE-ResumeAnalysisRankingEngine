"""Backward-compatible entry point.

Allows `python -m resume_embedding.main` to keep working.
"""

from .app.main import main

if __name__ == "__main__":
    main()
