# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A task manager exposed as an MCP server. Postgres (via Drizzle ORM) stores tasks, FastMCP (`@prefecthq/fastmcp-ts`) serves four tools over HTTP, and two separate consumers call those tools: a plain MCP client and a LangChain agent. ESM project (`"type": "module"`), so relative imports use the `.js` extension (e.g. `./services/task.js`).

## Commands

```bash
npm run db:up          # start Postgres 17 (docker compose); host port is 5434, not 5432
npm run db:migrate     # apply drizzle/ migrations
npm run db:generate    # generate a migration after editing src/db/schema.ts
npm run db:studio      # Drizzle Studio

# The MCP server (must be running for the client and the agent). Not an npm script:
npx fastmcp run src/server.ts --transport http --port 3000

npm run dev            # runs src/index.ts -> the MCP *client* (not the server)
npm run client         # runs src/client.ts
npm run langchain      # interactive LangChain agent (needs OPENAI_API_KEY)
npm run build          # tsc -> dist/ ; `npm start` runs dist/index.js (the client)
```

There is no test or lint setup. `.env` needs `DATABASE_URL` (`postgresql://mcp:mcp@localhost:5434/mcp` matches docker-compose) and, for the agent, `OPENAI_API_KEY`.

## Architecture

- `src/server.ts` — FastMCP server `task-manager`; registers `create-task`, `get-tasks`, `update-task`, `delete-task` with zod input schemas and delegates to `src/services/task.ts`. Task `id` is passed as a string. Enum values (`todo|in_progress|completed`, `low|medium|high`) are duplicated here as zod enums and in the DB schema, so keep them in sync when changing either.
- `src/services/task.ts` → `src/db/database.ts` / `src/db/schema.ts` — Drizzle + `postgres` driver; `database.ts` throws if `DATABASE_URL` is unset. `schema.ts` exports `TaskStatus` / `TaskPriority` pg enums, which `client.ts` uses for types. Migrations in `drizzle/` are generated; don't hand-edit them or `drizzle/meta`.
- `src/client.ts` — connects at import time (top-level `await Client.connect('http://localhost:3000/mcp')`) and exports helper functions. `src/index.ts` picks which helper to call in `main`; the others are commented out by design.
- `src/langchain.ts` — standalone agent using `@langchain/mcp-adapters` (`MCPAdapter`) + `createAgent` with `gpt-4o-mini` and a `MemorySaver` checkpointer. `closeObjectSchemas` mutates each MCP tool's JSON schema to set `additionalProperties: false`, because OpenAI rejects tool schemas without it; keep that step if tool schemas change.
- `.mcp.json` registers the running server as `my_local_mcp` (http, `localhost:3000/mcp`) so Claude Code itself can call the task tools; the server must be started manually first.

## Conventions

- Communicate in English only; code comments and docs in English (from the former `.cursor/rules` project rule).
