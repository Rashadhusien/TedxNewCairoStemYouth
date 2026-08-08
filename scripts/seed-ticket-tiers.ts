import "dotenv/config";
import { db } from "../lib/db";
import { ticketTiers, users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function seedTicketTiers() {
  console.log("Seeding ticket tiers...");

  // Get an existing admin user to use as createdBy
  const [adminUser] = await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  if (!adminUser) {
    console.error("No admin user found. Please create an admin user first.");
    process.exit(1);
  }

  console.log(`Using admin user: ${adminUser.email} (${adminUser.id})`);

  const tiers = [
    {
      type: "general" as const,
      label: "Regular Ticket",
      subtitle: "General Admission",
      pricePiastres: 35_000,
      features: [
        "General admission",
        "Full-day access to all talks",
        "Event kit included",
      ],
      displayOrder: 0,
      isActive: true,
    },
  ];

  for (const tier of tiers) {
    try {
      await db.insert(ticketTiers).values(tier);
      console.log(`✓ Created ticket tier: ${tier.label}`);
    } catch (error) {
      console.error(`✗ Failed to create ticket tier ${tier.label}:`, error);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seedTicketTiers().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
