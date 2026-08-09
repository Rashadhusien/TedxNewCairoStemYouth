import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const sql = neon(process.env.DATABASE_URL!);

async function runMigration() {
  console.log("Creating tags tables...");

  try {
    // Tags table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS "tags" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" varchar(100) NOT NULL,
        "slug" varchar(120) NOT NULL,
        "color" varchar(20),
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "tags_slug_unique" UNIQUE("slug")
      )
    `);
    console.log("✓ Created tags table");

    // Case-insensitive uniqueness on the display name
    await sql.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "tags_lower_name_unique"
      ON "tags" (lower("name"))
    `);
    console.log("✓ Created tags lower(name) unique index");

    // Promo code tags join table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS "promo_code_tags" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "promo_code_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "pct_promo_code_tag_unique" UNIQUE("promo_code_id","tag_id"),
        CONSTRAINT "promo_code_tags_promo_code_id_promo_codes_id_fk"
          FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id")
          ON DELETE cascade ON UPDATE no action,
        CONSTRAINT "promo_code_tags_tag_id_tags_id_fk"
          FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id")
          ON DELETE cascade ON UPDATE no action
      )
    `);
    console.log("✓ Created promo_code_tags table");

    // Indexes for filtering
    await sql.query(`
      CREATE INDEX IF NOT EXISTS "pct_promo_code_idx"
      ON "promo_code_tags" ("promo_code_id")
    `);
    await sql.query(`
      CREATE INDEX IF NOT EXISTS "pct_tag_idx"
      ON "promo_code_tags" ("tag_id")
    `);
    console.log("✓ Created join table indexes");

    console.log("\nMigration completed successfully!");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  }
}

runMigration().catch(console.error);
