"""Resume Embedding Pipeline.

This top-level package re-exports from .app
for backward compatibility and programmatic access.

Supported input formats (auto-detected by file extension):
    .jsonl, .json  — Structured candidate records (Pydantic-validated)
    .pdf           — PDF resumes (requires PyMuPDF)
    .png, .jpg, .jpeg, .bmp, .tiff — Resume images (requires pytesseract + Pillow)
    .md            — Markdown resumes
    .txt           — Plain text resumes
"""

from .app.config import PipelineSettings
from .app.input import detect_input_type, dispatch
from .app.io import load_candidates, load_embeddings, save_embeddings
from .app.model import candidate_to_text, generate_embeddings, l2_normalize
from .app.pipeline import run_pipeline

__all__ = [
    "run_pipeline",
    "load_candidates",
    "candidate_to_text",
    "generate_embeddings",
    "l2_normalize",
    "save_embeddings",
    "load_embeddings",
    "PipelineSettings",
    "dispatch",
    "detect_input_type",
]
