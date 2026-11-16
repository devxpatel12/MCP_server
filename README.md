# MCP Task Server

A local task manager exposed as an MCP server. Postgres stores the tasks, FastMCP serves the tools over HTTP, and a small client (plus an optional LangChain agent) calls those tools.

## Prerequisites

- Node.js 20 or newer
- Docker, for the Postgres container

## Step 1 — Initialize the app

```bash
npm init -y
```

Create a `.env` file for secrets. `.env` is gitignored. Copy the example and fill it in during the later steps:

```bash
cp .env.example .env
```

## Step 2 — Install dependencies

```bash
npm install
```

Runtime packages: `@prefecthq/fastmcp-ts`, `zod`, `drizzle-orm`, `postgres`, `dotenv`, `langchain`, `@langchain/core`, `@langchain/langgraph`, `@langchain/mcp-adapters`, `@langchain/openai`, and `@modelcontextprotocol/sdk`.

Dev packages: `typescript`, `tsx`, `drizzle-kit`, and `@types/node`.

`package.json` sets `"type": "module"`, so source files use ESM imports.

## Step 3 — TypeScript

`tsconfig.json` compiles `src` to `dist`. `tsx` runs TypeScript directly, so a build is only needed for `npm start`.

```bash
npm run build   # tsc
npm start       # node dist/index.js
```

Day-to-day development uses `npm run dev`, which runs `tsx src/index.ts`.

## Step 4 — Start Postgres

`docker-compose.yml` runs Postgres 17. The container listens on 5432. Your machine reaches it on **5434**, so it does not clash with a local Postgres on 5432.

```bash
npm run db:up
```

That is `docker compose up -d`. Wait until the container is healthy:

```bash
docker compose ps
```

Stop it later with:

```bash
npm run db:down
```

`npm run db:down` keeps the `mcp_pg_data` volume. `docker compose down -v` deletes that volume and the database with it.

## Step 5 — Point the app at the database

Put this in `.env`. User, password, database name, and port match `docker-compose.yml`.

```env
DATABASE_URL="postgresql://mcp:mcp@localhost:5434/mcp"
OPENAI_API_KEY=""
```

`OPENAI_API_KEY` is only required for the LangChain agent in Step 8.

`src/db/database.ts` reads `DATABASE_URL` and throws if it is missing.

## Step 6 — Create the tables

The schema lives in `src/db/schema.ts`. Drizzle Kit is configured in `drizzle.config.ts` and writes SQL into `drizzle/`.

Migrations already in the repo:

1. `drizzle/0000_init_notes.sql` creates a `notes` table.
2. `drizzle/0001_tasks.sql` drops `notes` and creates the `tasks` table, plus the `task_status` and `task_priority` enums.

Apply them:

```bash
npm run db:migrate
```

After you change `src/db/schema.ts`, generate a new migration, then migrate again:

```bash
npm run db:generate
npm run db:migrate
```

Browse the data with:

```bash
npm run db:studio
```

## Step 7 — Start the MCP server

`src/server.ts` registers four tools on a FastMCP server named `task-manager`:

| Tool | What it does |
| --- | --- |
| `create-task` | Insert a task (`title`, `description`, `status`, `priority`) |
| `get-tasks` | Return every task |
| `update-task` | Update a task by `id` |
| `delete-task` | Delete a task by `id` |

`status` is `todo`, `in_progress`, or `completed`. `priority` is `low`, `medium`, or `high`.

Start the server on port 3000. Leave this terminal running.

```bash
npx fastmcp run src/server.ts --transport http --port 3000
```

The server listens at `http://127.0.0.1:3000/mcp`.

## Step 8 — Call the server

In a second terminal, run the client:

```bash
npm run dev
```

`src/index.ts` connects with `Client.connect('http://localhost:3000/mcp')` and calls `get-tasks`. The other helpers in `src/client.ts` (`create-task`, `update-task`, `listTools`) are commented out in `main`. Uncomment the one you want to exercise, then run `npm run dev` again.

## Step 9 — Optional LangChain agent

The agent in `src/langchain.ts` loads the same MCP tools and talks to `gpt-4o-mini`. Set `OPENAI_API_KEY` in `.env`, keep the server from Step 7 running, then:

```bash
npx tsx src/langchain.ts
```

Type a question at the prompt. Type `q` to exit.

## Scripts

| Script | Command |
| --- | --- |
| `npm run dev` | Run the MCP client |
| `npm run build` | Compile TypeScript to `dist` |
| `npm start` | Run the compiled client |
| `npm run db:up` | Start Postgres in the background |
| `npm run db:down` | Stop Postgres |
| `npm run db:generate` | Generate a migration from the schema |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio |
