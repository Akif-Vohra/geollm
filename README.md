# GeoLLM 

I like looking up Geography/History/Maps. I created this app to ask questions 
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

I plan to implement two modes.

- Direct calls to OpenAPI via User's own API key in JS
- Backend mode supported by locally run model. Qwen/Gemma? (I am not sure how good these would be to generate data)

# Frontend

I am a bit rusty with frontend, but I decided to go with vite and alpine after
some initial reading on the latest JS ecosystem. I think the frontend would 
remain minimal and not very complex. With alpine.js I get the required DOM 
bindings and reactive states without a lot of overhead. If I think of more
features in the future, maybe I would consider React?

Following should be enable to get the frontend running.

    npm install
    npm run dev

Frontend

# Backend

Still to do. I am thinking of going with Flask. TBD.
