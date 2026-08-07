import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const sql = neon(process.env.DATABASE_URL!);

async function seedPackages() {
  console.log("Seeding packages...");

  const packagesToSeed = [
    {
      name: "Regular",
      description: "Single ticket for regular admission",
      ticketCount: 1,
      pricePerTicketPiastres: 38000,
      totalPricePiastres: 38000,
      requiresAccessCode: false,
      displayOrder: 1,
      isActive: true,
    },
    {
      name: "3 Friends",
      description: "3 tickets at a discounted group rate",
      ticketCount: 3,
      pricePerTicketPiastres: 30000,
      totalPricePiastres: 90000,
      requiresAccessCode: true,
      displayOrder: 2,
      isActive: true,
    },
    {
      name: "5 Friends",
      description: "5 tickets at an even better group rate",
      ticketCount: 5,
      pricePerTicketPiastres: 27000,
      totalPricePiastres: 135000,
      requiresAccessCode: true,
      displayOrder: 3,
      isActive: true,
    },
  ];

  for (const pkg of packagesToSeed) {
    try {
      await sql`
        INSERT INTO packages (name, description, ticket_count, price_per_ticket_piastres, total_price_piastres, requires_access_code, display_order, is_active, created_by)
        VALUES (${pkg.name}, ${pkg.description}, ${pkg.ticketCount}, ${pkg.pricePerTicketPiastres}, ${pkg.totalPricePiastres}, ${pkg.requiresAccessCode}, ${pkg.displayOrder}, ${pkg.isActive}, NULL)
      `;
      console.log(`✓ Inserted package: ${pkg.name}`);
    } catch (e: unknown) {
      const error = e as Error;
      if (error.message.includes("duplicate key")) {
        console.log(`- Package already exists: ${pkg.name}`);
      } else {
        console.error(`✗ Error inserting package ${pkg.name}:`, error.message);
      }
    }
  }

  console.log("\nPackage seeding completed!");
}

seedPackages().catch(console.error);
