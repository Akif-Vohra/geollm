"""Model catalogue for the backend.

The set of models the app offers is data, not code: it lives in
``backend/config.json`` (copied from ``config.example.json``) so it can change
without editing the source. Each entry declares a ``provider`` so the app is
not tied to Ollama once cloud providers are added.
"""

import json
import os

from pydantic import BaseModel

_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
_CONFIG = os.path.join(_BACKEND_DIR, "config.json")


class ModelInfo(BaseModel):
    """A single selectable model.

    :param id: model id passed to the provider (Ollama tag, e.g. "qwen3:8b")
    :param label: human-readable name shown in the UI
    :param provider: how the model is called ("ollama" for now)
    """

    id: str
    label: str
    provider: str = "ollama"


def _load_models() -> list[ModelInfo]:
    """Load and validate the model catalogue from ``config.json``.

    :return: the configured models, in the order they appear in the file
    :raises FileNotFoundError: if ``config.json`` does not exist
    """
    if not os.path.exists(_CONFIG):
        raise FileNotFoundError(
            f"Config file not found: {_CONFIG}. "
            "Copy config.example.json to config.json to get started."
        )
    with open(_CONFIG) as f:
        data = json.load(f)
    return [ModelInfo(**m) for m in data["models"]]


AVAILABLE_MODELS: list[ModelInfo] = _load_models()

_BY_ID = {m.id: m for m in AVAILABLE_MODELS}


def get_model(model_id: str) -> ModelInfo | None:
    """Look up a configured model by its id.

    :param model_id: the model id to find
    :return: the matching :class:`ModelInfo`, or ``None`` if not configured
    """
    return _BY_ID.get(model_id)
