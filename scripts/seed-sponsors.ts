import "dotenv/config";
import { db } from "../lib/db";
import { sponsors, users } from "../lib/db/schema";
import {
  confirmedSponsorsList,
  sponsorPartners,
} from "../constants/sponsors-page";
import { eq } from "drizzle-orm";

async function seedSponsors() {
  console.log("Seeding sponsors...");

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

  // Seed sponsors
  for (const sponsor of confirmedSponsorsList) {
    try {
      await db.insert(sponsors).values({
        name: sponsor.name,
        description: sponsor.description,
        tier: "gold", // Default tier for confirmed sponsors
        type: "sponsor",
        isActive: true,
        displayOrder: 0,
        boothPointMultiplier: 1,
        createdBy: adminUser.id,
      });
      console.log(`✓ Created sponsor: ${sponsor.name}`);
    } catch (error) {
      console.error(`✗ Failed to create sponsor ${sponsor.name}:`, error);
    }
  }

  // Seed partners
  for (const partner of sponsorPartners) {
    try {
      await db.insert(sponsors).values({
        name: partner.name,
        description: partner.description,
        tier: "platinum", // Default tier for partners
        type: "partner",
        isActive: true,
        displayOrder: 0,
        boothPointMultiplier: 1,
        createdBy: adminUser.id,
      });
      console.log(`✓ Created partner: ${partner.name}`);
    } catch (error) {
      console.error(`✗ Failed to create partner ${partner.name}:`, error);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seedSponsors().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
