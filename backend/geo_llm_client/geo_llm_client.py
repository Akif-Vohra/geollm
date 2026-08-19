from enum import Enum

from langchain.chat_models import init_chat_model
from langchain_ollama import ChatOllama
from pydantic import BaseModel

from .models import InteractivePointSchema


class GeoDataType(str, Enum):
    INTERACTIVE_POINT = "interactive_point"
    FLOW_ROUTE = "flow_route"
    TIMELINE = "timeline"
    CHOROPLETH = "choropleth"


class GeoLLMClient:

    PROMPTS: dict[GeoDataType, str] = {
        GeoDataType.INTERACTIVE_POINT: """
                Find *modern geographic locations* names for the locations 
                which can answer user's query. User Query : {query}""",
    }

    SCHEMAS: dict[GeoDataType, type[BaseModel]] = {
        GeoDataType.INTERACTIVE_POINT: InteractivePointSchema,
    }

    CLOUD_MODELS = [
        "gpt-4.1",
        "gpt-4o-mini",
        "gpt-4o",
        "gpt-3.5-turbo",
    ]

    def __init__(self, model_name: str):
        """
        Unified LLM client wrapper.
        Cloud models go through init_chat_model(); anything else is
        treated as an Ollama tag (e.g. "qwen3:8b"). Ollama owns the list
        of locally installed models, so we do not duplicate it here.
        """
        if model_name in self.CLOUD_MODELS:
            self.llm_model = init_chat_model(model=model_name)
        else:
            self.llm_model = ChatOllama(model=model_name)

    # ---- Helpers you (or subclasses) can override if needed ----
    def prompt_for(self, dtype: GeoDataType, query: str) -> str:
        """
        :param dtype: GeoDataType of type ENUM GeoDataType
        :param query: User query for which we should generate the prompt
        :return: Prompt to invoke as string
        """
        try:
            template = self.PROMPTS[dtype]
        except KeyError:
            raise ValueError(f"No prompt registered for {dtype}")
        return template.format(query=query)

    def schema_for(self, dtype: GeoDataType) -> type[BaseModel]:
        try:
            return self.SCHEMAS[dtype]
        except KeyError:
            raise ValueError(f"No schema registered for {dtype}")

    def generate_data(self, query: str, geo_data_type: GeoDataType):
        """
        Run a simple prompt through whichever model is active.
        """
        schema = self.schema_for(geo_data_type)
        prompt = self.prompt_for(geo_data_type, query)

        structured_llm = self.llm_model.with_structured_output(schema)
        result = structured_llm.invoke(prompt)
        return result.model_dump()
