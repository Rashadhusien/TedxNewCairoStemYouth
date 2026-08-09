import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const sql = neon(process.env.DATABASE_URL!);

async function runMigration() {
  console.log("Creating app_settings table...");

  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS "app_settings" (
        "key" varchar(100) PRIMARY KEY NOT NULL,
        "value" text NOT NULL,
        "updated_by" uuid,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "app_settings_updated_by_users_id_fk"
          FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id")
          ON DELETE no action ON UPDATE no action
      )
    `);
    console.log("✓ Created app_settings table");

    await sql.query(`
      CREATE INDEX IF NOT EXISTS "app_settings_updated_by_idx"
      ON "app_settings" ("updated_by")
    `);
    console.log("✓ Created app_settings index");

    // Seed the default ticket limit setting (500)
    await sql.query(`
      INSERT INTO "app_settings" ("key", "value", "updated_at")
      VALUES ('max_total_tickets', '500', now())
      ON CONFLICT ("key") DO NOTHING
    `);
    console.log("✓ Seeded max_total_tickets setting (500)");

    console.log("\nMigration completed successfully!");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  }
}

runMigration().catch(console.error);
