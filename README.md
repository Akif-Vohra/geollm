# GeoLLM 

I like looking up Geography/History/Maps. I created this app for myself to ask questions 
to LLM and generate a map in return. Frontend and Backend are separate so 
just calling an API endpoint should also work. Right now it is quite basic. 
You ask a question and it generates a interactive point map. However, I think
i would like to extend to add following types of maps in future. e.g

- Heat Maps for "Density of trade cities mentioned in medieval texts."
- Flow/Route maps for "Journey of Ibn Battuta"
- Timeline Maps for "Evolution of Mughal capitals from 1526 → 1707."
- Choropleth Maps for "Number of mentions of each country in a text corpus."
- May be even more. If you have any ideas please let me know or may be you can also contribute.

<img width="3432" height="1718" alt="image" src="https://github.com/user-attachments/assets/3cd602ac-fbe8-4d12-80eb-b34f41d16448" />

The frontend calls the backend, which runs a local model through Ollama to
generate the map data — one path, fully local. (An earlier version could also
call OpenAI directly from the browser with your own key; that mode has been
removed.)

Next I want to try a factual mode that pulls structured data from a source
like Wikidata instead of relying on the model alone, so places and
coordinates are grounded rather than generated.

# Frontend

I am a bit rusty with frontend, but I decided to go with vite and alpine after
some initial reading on the latest JS ecosystem. I think the frontend would 
remain minimal and not very complex. With alpine.js I get the required DOM 
bindings and reactive states without a lot of overhead. If I think of more
features in the future, maybe I would consider React?

Following should be enough to get the frontend running.

    cd frontend
    npm install
    cp .env.example .env
    npm run dev

`.env` just points the frontend at the backend, and defaults to
`http://127.0.0.1:8000`. Vite serves on http://localhost:5173

# Backend

FastAPI, with dependencies managed by uv.

    uv sync
    uv run uvicorn --app-dir backend main:app --port 8000

Interactive API docs are at http://127.0.0.1:8000/docs

The model name is handed straight to Ollama, so pass the full tag exactly
as `ollama list` prints it, e.g. `qwen3:8b`.
