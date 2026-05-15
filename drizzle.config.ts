import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Verbose logging during migrations
  verbose: true,
  strict: true,
} satisfies Config;
