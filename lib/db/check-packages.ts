import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const sql = neon(process.env.DATABASE_URL!);

async function checkPackages() {
  console.log("Checking packages table...");

  try {
    // Check if table exists
    const tables = await sql.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'packages'
    `);
    
    if (tables.length === 0) {
      console.log("✗ packages table does not exist");
      return;
    }
    
    console.log("✓ packages table exists");

    // Check if there are any packages
    const packages = await sql.query(`
      SELECT id, name, ticket_count, price_per_ticket_piastres, is_active
      FROM packages
      LIMIT 5
    `);
    
    console.log(`\nFound ${packages.length} package(s) in database:`);
    
    if (packages.length === 0) {
      console.log("No packages found. You need to create packages.");
      console.log("\nTo create initial packages, run:");
      console.log("npx tsx lib/db/seed-packages.ts");
    } else {
      packages.forEach((pkg: any) => {
        console.log(`- ${pkg.name} (${pkg.ticket_count} tickets, ${pkg.price_per_ticket_piastres / 100} EGP/ticket, active: ${pkg.is_active})`);
      });
    }
  } catch (error) {
    console.error("✗ Error checking packages:", error);
  }
}

checkPackages().catch(console.error);
