import logging

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from geo_llm_client.exceptions import UnsupportedModelError
from geo_llm_client.geo_llm_client import GeoDataType, GeoLLMClient
from geo_llm_client.models import ApiEnvelope, Meta
from utils import get_geo_coordinates

app = FastAPI(title="GeoLLM Backend", version="0.1")


@app.exception_handler(UnsupportedModelError)
async def unsupported_model_handler(_, exc: UnsupportedModelError):
    return JSONResponse(
        status_code=422,
        content={
            "ok": False,
            "error": {
                "code": "UNSUPPORTED_MODEL",
                "message": str(exc),
                "hint": "Use one of the supported models",
            },
        },
    )


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


@app.get("/api/generate_geo_data")
def generate_geo_data(query: str = Query(...), model_name: str = Query(...)):
    logger.info(
        "Received query: %s with model name %s",
        query,
        model_name,
    )
    client = GeoLLMClient(model_name)
    result = client.generate_data(
        query=query,
        geo_data_type=GeoDataType.INTERACTIVE_POINT,
    )
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
