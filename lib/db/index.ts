/**
 * Drizzle ORM client — Neon PostgreSQL
 *
 * Uses node-postgres driver with Neon PostgreSQL which works in:
 * - Next.js App Router (Node.js runtime)
 * - Vercel serverless functions
 *
 * Uses standard PostgreSQL connection with full transaction support.
 * Connection is pooled via Neon's built-in connection pooler.
 * Never import this in client components — server-only.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/lib/db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

export type DB = typeof db;
