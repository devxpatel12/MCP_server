import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to .env, then start Postgres with npm run db:up.");
}

const client = postgres(connectionString);

export const db = drizzle(client, { schema });
export { client, schema };
