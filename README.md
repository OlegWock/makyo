# Katuko

Frontend for ChatGPT, Claude and local Ollama models with modern UI.

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


To create new component:

```bash
bun scaffold component new Button
```

This project was created using `bun init` in bun v1.1.4. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
