import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const sql = neon(process.env.DATABASE_URL!);

async function checkPackageDiscount() {
  console.log("Checking package discounted prices...");

  try {
    const packages = await sql.query(`
      SELECT id, name, price_per_ticket_piastres, discounted_price_per_ticket_piastres, is_active
      FROM packages
      ORDER BY display_order
    `);
    
    console.log(`\nFound ${packages.length} package(s):\n`);
    
    packages.forEach((pkg: any) => {
      const regularPrice = pkg.price_per_ticket_piastres / 100;
      const discountedPrice = pkg.discounted_price_per_ticket_piastres ? pkg.discounted_price_per_ticket_piastres / 100 : null;
      
      console.log(`${pkg.name}:`);
      console.log(`  Regular price: ${regularPrice} EGP`);
      console.log(`  Discounted price: ${discountedPrice ? discountedPrice + ' EGP' : 'Not set'}`);
      console.log(`  Active: ${pkg.is_active}`);
      console.log(`  Has discount: ${discountedPrice ? 'YES' : 'NO'}\n`);
    });
  } catch (error) {
    console.error("✗ Error checking packages:", error);
  }
}

checkPackageDiscount().catch(console.error);
