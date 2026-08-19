import logging

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from config import AVAILABLE_MODELS, get_model
from geo_llm_client.geo_llm_client import GeoDataType, GeoLLMClient
from geo_llm_client.models import ApiEnvelope, Meta
from utils import get_geo_coordinates

app = FastAPI(title="GeoLLM Backend", version="0.1")


logger = logging.getLogger("uvicorn")  # your app logger

# 🔹 Allow your frontend origin (Vite runs on :5173)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app.add_middleware(
    # ignore[arg-type] because of pycharm bug
    # https://github.com/fastapi/fastapi/discussions/10968
    CORSMiddleware,  # type: ignore[arg-type]
    allow_origins=origins,  # or ["*"] for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/models")
def list_models():
    """List the models available to the frontend.

    :return: the configured models as ``{id, label, provider}`` dicts
    """
    return [m.model_dump() for m in AVAILABLE_MODELS]


@app.get("/api/generate_geo_data")
def generate_geo_data(query: str = Query(...), model_name: str = Query(...)):
    """Generate map data for a natural-language query.

    :param query: the user's question
    :param model_name: id of a model from ``GET /api/models``
    :return: an :class:`ApiEnvelope` of geocoded places
    :raises HTTPException: 400 if the model is unknown, 502 if the LLM fails
    """
    logger.info(
        "Received query: %s with model name %s",
        query,
        model_name,
    )
    model = get_model(model_name)
    if model is None:
        detail = f"Unknown model: {model_name}"
        raise HTTPException(status_code=400, detail=detail)
    client = GeoLLMClient(model.id, provider=model.provider)
    try:
        result = client.generate_data(
            query=query,
            geo_data_type=GeoDataType.INTERACTIVE_POINT,
        )
    except Exception as exc:
        # Unknown model name, Ollama not running, bad API key: all arrive
        # here from an external service, so report them as an upstream
        # failure instead of a bare 500 with a stack trace.
        logger.exception("LLM call failed for model %s", model_name)
        detail = f"LLM call failed: {exc}"
        raise HTTPException(status_code=502, detail=detail) from exc
    result = get_geo_coordinates(result)
    envelope = ApiEnvelope(
        meta=Meta(
            query=query,
            geo_data_type=GeoDataType.INTERACTIVE_POINT,
            model_name=model_name,
        ),
        data=result,
    )
    return envelope.model_dump()
