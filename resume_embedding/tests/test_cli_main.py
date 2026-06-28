"""Tests for CLI model listing behavior."""

import sys

from resume_embedding.app.main import _build_parser, main


def test_parser_accepts_list_models_flag() -> None:
    """CLI parser should support --list-models."""
    args = _build_parser().parse_args(["--list-models"])
    assert args.list_models is True


def test_main_list_models_prints_available_models(
    monkeypatch,
    capsys,
) -> None:
    """--list-models should print available models and exit cleanly."""
    monkeypatch.setattr(sys, "argv", ["resume-embed", "--list-models"])

    main()
    out = capsys.readouterr().out

    assert "Available embedding models:" in out
    assert "- BAAI/bge-small-en-v1.5" in out
