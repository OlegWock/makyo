# Katuko

Frontend for ChatGPT, Claude and local Ollama models with modern UI.


## Roadmap

- [ ] Chat settings (so far just a temperature, system prompt and title change)
- [ ] Better chats management screen
  - [ ] rename/delete
  - [ ] search + go to message
- [ ] Better 'New chat' screen: suggest user some pre-defined questions or continue one of recent chats
- [ ] Docker deployment
- [ ] Support for snippets
  - [ ] Snippets management (add/edit/delete)
  - [ ] Snippets handling (insert snippet when user types `/keyword`)
  - [ ] Autocomplete for snippets when user types `/`
  - [ ] Experiment maybe to allow entering just `keyword` and then pressing Tab
  - [ ] Allow placing placeholders in the snippet (when pasted, user will be prompted to fill placeholders)
- [ ] Support for personas
  - [ ] Essentially just a preset with name, icon and chat settings (model, temperature, system prompt)
  - [ ] When creating new chat, parameters are copied + chat is associated with persona, but user can change any parameter

## Deploy

There will be Docker/docker-compose option.

## Local development

To install dependencies:

```bash
bun install
```

Setup database:

```bash
bun run drizzle:schema
bun run drizzle:migrate
bun run drizzle:seed
```

To run:

```bash
bun run server
bun run client
```

* Server available on [localhost:8440](http://localhost:8440)
  * API docs available on [localhost:8440/scalar](http://localhost:8440/scalar)
* Client available on [localhost:8441](http://localhost:8441)

There is a template to easily create new components and routes:

```bash
bun scaffold component new Button
bun scaffold route new DetailsPage
```

This project was created using `bun init` in bun v1.1.4. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
