import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const sql = neon(process.env.DATABASE_URL!);

async function runMigration() {
  console.log("Adding missing columns to packages table...");

  try {
    // Add discounted_price_per_ticket_piastres column
    await sql.query(`
      ALTER TABLE "packages" 
      ADD COLUMN IF NOT EXISTS "discounted_price_per_ticket_piastres" integer
    `);
    console.log("✓ Added discounted_price_per_ticket_piastres column");

    // Add is_promo_applicable column
    await sql.query(`
      ALTER TABLE "packages" 
      ADD COLUMN IF NOT EXISTS "is_promo_applicable" boolean DEFAULT false NOT NULL
    `);
    console.log("✓ Added is_promo_applicable column");

    console.log("\nMigration completed successfully!");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  }
}

runMigration().catch(console.error);
