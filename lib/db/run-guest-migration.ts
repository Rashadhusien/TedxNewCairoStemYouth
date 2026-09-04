import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const sql = neon(process.env.DATABASE_URL!);

async function runGuestMigration() {
  const migration = `
-- Step 1: Make tickets.userId nullable
ALTER TABLE "tickets" ALTER COLUMN "user_id" DROP NOT NULL;

-- Step 2: Update foreign key to SET NULL instead of CASCADE
-- This preserves ticket/order records even if the associated user account is deleted
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_user_id_users_id_fk";
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

-- Step 3: Make orders.userId nullable
ALTER TABLE "orders" ALTER COLUMN "user_id" DROP NOT NULL;

-- Step 4: Update foreign key to SET NULL instead of CASCADE
-- This preserves order records even if the associated user account is deleted
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_users_id_fk";
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
`;

  const statements = migration
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      await sql.query(stmt);
      console.log("✓ Executed:", stmt.substring(0, 60) + "...");
    } catch (e: unknown) {
      const error = e as Error;
      console.error("✗ Error:", error.message);
      // Continue with other statements
    }
  }

  console.log("\nGuest tickets migration completed!");
}

runGuestMigration().catch(console.error);
