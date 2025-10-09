from typing import Any

from pydantic import BaseModel, Field


class Meta(BaseModel):
    query: str
    geo_data_type: str
    model_name: str
    version: str = "0.1"


class ApiEnvelope(BaseModel):
    meta: Meta
    data: dict[str, Any]


class Place(BaseModel):
    name: str = Field(description="Modern place name")
    context: str | None = Field(
        description="Short description of why it's relevant",
    )


class InteractivePointSchema(BaseModel):
    places: list[Place] = Field(default_factory=list)
