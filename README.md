# Makyō

Frontend for ChatGPT, Claude and local Ollama models with modern UI.


## Roadmap

- [ ] Selection text menu: when user selects some text in chat, show menu proposing to ask LLM 'more about X', 'what is X', 'don't tell me about X', etc
  Ref: https://codesandbox.io/p/sandbox/floating-ui-react-range-selection-tkpj9v?file=%2Fsrc%2FApp.tsx%3A21%2C22
- [ ] Multimodal (start with vision, maybe expand to image generation) LLMs support
- [ ] Support for perplexity.ai provider (with citations)
- [ ] Semantic/vector search across messages
- [ ] Autocomplete for snippets when user types `/` or `@`


## Deploy

Easiest way to deploy is Docker. Copy file `.env.example` and rename it to just `.env`. Edit the file and put password and API keys for services you intend to use there.

If you decide to use local Ollama proxy, you need to add domain where you deploy Makyo to `OLLAMA_ORIGINS` variable. [How to set variables for Ollama](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server).

And then run container with docker compose (might require using sudo, depending on Docker setup):

```bash
# -d to run in background
# add --build to build container after pulling newer version
docker-compose up -d
```

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
