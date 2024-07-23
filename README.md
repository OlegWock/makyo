# Makyō

Frontend for ChatGPT, Claude and local Ollama models with modern UI.


## Roadmap

* Polish new React Flow UI
  * Remember position on canvas and scroll to it when opening chat
  * Or scroll to most recent message if no position saved
* Remove ChatLayout component
* Get rid of message tree stuff
* Replace OpenAPI with just RPC


---

Nice to have:
- Multimodal (start with vision, maybe expand to image generation) LLMs support
  Ref [MULTIMODALITY.md](/MULTIMODALITY.md)
- Long term memory. 
  `@remember` or something to add fact to LLM memory. Not sure how to implement though
- RAG
    - Ability to create ‘folders’ and upload documents there
    - Ability to share folder with a persona/specific chat
    - Use RAG to answer questions related to the documents
- Plugins / functions calling
    - Like search in google or make calls to API and so on
- Autocomplete for snippets when user types `/` or `@`
- Allow setting user message for personas
- Speech to text for user messages
- Models management UI for Ollama: pull and create from Modelfile


## Deploy

Easiest way to deploy is Docker. Copy file `.env.example` and rename it to just `.env`. Edit the file and put password and API keys for services you intend to use there.

If you decide to use local Ollama proxy, you need to add domain where you deploy Makyo to `OLLAMA_ORIGINS` variable. [How to set variables for Ollama](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server).

And then run container with docker compose (might require using sudo, depending on Docker setup):

```bash
# -d to run in background
# add --build to build container after pulling newer version
docker-compose up -d
```

**Note:** if hosting behind nginx (or other reverse proxy), make sure to increase `proxy_read_timeout` (or equivalent for your proxy) to allow for SSE and WebSockets to work properly.

## Local development

**Due to usage of pre-compiled SQLite extensions, local development only supported for Mac OS on ARM and Linux (ARM/x64).**

On Mac, you'll need to install SQLite from Homberwer:

```bash
brew install sqlite
```

If you want to use OpenAI/Anthropic provider, copy `.env.development` and rename it to `.env.local` and put your keys there.

Then to run app locally without docker, first install dependencies:

```bash
bun install
```

Setup database:

```bash
bun run drizzle:migrate
bun run drizzle:seed
```

Run dev server and frontend:

```bash
bun run server
bun run client
```

* Backend available on [localhost:8440](http://localhost:8440)
  * API docs available on [localhost:8440/scalar](http://localhost:8440/scalar)
* Frontend available on [localhost:8441](http://localhost:8441)

## Development

To generate migration after DB schema change:

```bash
bun run drizzle:schema
```

To delete DB and all drizzle files and then generate them from scratch:

```bash
bun run drizzle:nuke
```

There is a template to easily create new components and routes:

```bash
bun scaffold component new Button
bun scaffold route new DetailsPage
```

---

This project was created using `bun init` in bun v1.1.4. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
