# Makyō

Frontend for ChatGPT, Claude and local Ollama models with modern UI.


## Roadmap

- [ ] Switching model mid-chat
  - [ ] Correctly labeling which model sent the message
- [ ] Support for snippets
  - [ ] Snippets management (add/edit/delete)
  - [ ] Snippets handling (insert snippet when user types `/keyword`)
  - [ ] Autocomplete for snippets when user types `/`
  - [ ] Experiment maybe to allow entering just `keyword` and then pressing Tab
  - [ ] Allow placing placeholders in the snippet (when pasted, user will be prompted to fill placeholders)
- [ ] Support for personas
  - [ ] Essentially just a preset with name, icon and chat settings (model, temperature, system prompt)
  - [ ] When creating new chat, parameters are copied + chat is associated with persona, but user can change any parameter
- [ ] Better 'New chat' screen: suggest user some pre-defined questions or continue one of recent chats
- [ ] Optimize frontend build size
- [ ] Multimodal (start with vision, maybe expand to image generation) LLMs support
- [ ] Support for perplexity.ai provider
- [ ] Semantic/vector search across messages


## Deploy

Easiest way to deploy is Docker. Copy file `.env.example` and rename it to just `.env`. Edit the file and put password and API keys for services you intend to use there. 

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
