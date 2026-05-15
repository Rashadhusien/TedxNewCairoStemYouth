import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";

const CREDENTIALS_PROVIDER = "credentials";

/** Create or update the credentials account row (email/password sign-in). */
export async function upsertCredentialsAccount(
  userId: string,
  plainPassword: string,
) {
  const password = await bcrypt.hash(plainPassword, 12);

  const existing = await db.query.accounts.findFirst({
    where: (a, { and, eq }) =>
      and(eq(a.userId, userId), eq(a.provider, CREDENTIALS_PROVIDER)),
  });

  if (existing) {
    await db
      .update(accounts)
      .set({ password })
      .where(
        and(
          eq(accounts.provider, CREDENTIALS_PROVIDER),
          eq(accounts.providerAccountId, existing.providerAccountId),
        ),
      );
    return;
  }

  await db.insert(accounts).values({
    userId,
    type: "credentials",
    provider: CREDENTIALS_PROVIDER,
    providerAccountId: userId,
    password,
  });
}
