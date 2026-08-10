import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const sql = neon(process.env.DATABASE_URL!);

async function updatePromoApplicable() {
  console.log("Updating promo applicable settings...");

  await sql`UPDATE packages SET is_promo_applicable = false WHERE name = ${"3 Friends"} OR name = ${"5 Friends"}`;

  await sql`UPDATE packages SET is_promo_applicable = true WHERE name = ${"Regular"}`;

  console.log(
    "✓ Promo applicable: Regular = true, 3 Friends = false, 5 Friends = false",
  );

  const packages =
    await sql`SELECT name, is_promo_applicable FROM packages ORDER BY display_order`;

  console.log("\nCurrent promo applicable settings:");
  packages.forEach((pkg) => {
    console.log(`  ${pkg.name}: ${pkg.is_promo_applicable ? "YES" : "NO"}`);
  });
}

updatePromoApplicable().catch(console.error);
