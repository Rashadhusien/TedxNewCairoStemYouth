import "dotenv/config";
import { eq } from "drizzle-orm";

import { db } from "../lib/db";
import { speakers, users } from "../lib/db/schema";
import { mainSpeakers, keyholders } from "../constants/speakers";

async function seedSpeakers() {
  console.log("🎤 Seeding speakers...");

  // Get admin user
  const [adminUser] = await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  if (!adminUser) {
    console.error("❌ No admin user found. Please create an admin first.");
    process.exit(1);
  }

  console.log(`Using admin: ${adminUser.email}`);

  // Seed main speakers
  for (const [index, speaker] of mainSpeakers.entries()) {
    try {
      await db.insert(speakers).values({
        name: speaker.name,
        role: speaker.role,
        description: speaker.description,
        tagline: speaker.tagline,
        type: "main",
        symbol: speaker.symbol,
        initials: null,
        accent: speaker.accent,
        roleColor: speaker.roleColor,
        imageUrl: speaker.image,
        displayOrder: index + 1,
        isActive: true,
        createdBy: adminUser.id,
      });

      console.log(`✅ Main Speaker: ${speaker.name}`);
    } catch (error) {
      console.error(`❌ Failed to create ${speaker.name}`, error);
    }
  }

  // Seed keyholders
  for (const [index, speaker] of keyholders.entries()) {
    try {
      await db.insert(speakers).values({
        name: speaker.name,
        role: speaker.role,
        description: speaker.tagline,
        tagline: speaker.tagline,
        type: "keyholder",
        symbol: null,
        initials: speaker.initials,
        accent: null,
        roleColor: null,
        imageUrl: speaker.image,
        displayOrder: mainSpeakers.length + index + 1,
        isActive: true,
        createdBy: adminUser.id,
      });

      console.log(`✅ Keyholder: ${speaker.name}`);
    } catch (error) {
      console.error(`❌ Failed to create ${speaker.name}`, error);
    }
  }

  console.log("🎉 Speakers seeded successfully!");
  process.exit(0);
}

seedSpeakers().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
