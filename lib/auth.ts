/**
 * NextAuth v5 (Auth.js) Configuration
 * TEDxNewCairoSTEMYouth
 *
 * - Credentials (email + password) via accounts table (provider: "credentials")
 * - OAuth (Google, etc.) via Drizzle adapter + accounts table
 * - JWT sessions with role + ticketStatus for middleware
 */

import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, accounts, verificationTokens } from "@/lib/db/schema";
import { credentialsSchema } from "@/lib/validation";

const CREDENTIALS_PROVIDER = "credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      ticketStatus: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    ticketStatus?: string | null;
  }
}

async function getTicketStatus(userId: string) {
  const ticket = await db.query.tickets.findFirst({
    where: (t, { eq }) => eq(t.userId, userId),
    columns: { status: true },
  });
  return ticket?.status ?? null;
}

async function loadUserAuthProfile(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  const ticketStatus = await getTicketStatus(user.id);
  return { ...user, ticketStatus };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // JWT sessions — omit sessionsTable (only needed for database session strategy)
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    verificationTokensTable: verificationTokens,
  }),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: false,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Invalid credentials format");
        }

        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);

        if (!user) {
          await bcrypt.compare(
            password,
            "$2b$10$placeholder.hash.to.prevent.timing.attacks",
          );
          throw new Error("Invalid email or password");
        }

        if (!user.isActive) {
          throw new Error("Account is deactivated. Contact support.");
        }

        const [credentialAccount] = await db
          .select({ password: accounts.password })
          .from(accounts)
          .where(
            and(
              eq(accounts.userId, user.id),
              eq(accounts.provider, CREDENTIALS_PROVIDER),
            ),
          )
          .limit(1);

        const passwordHash =
          credentialAccount?.password ?? user.passwordHash ?? null;

        if (!passwordHash) {
          throw new Error("Invalid email or password");
        }

        const passwordValid = await bcrypt.compare(password, passwordHash);
        if (!passwordValid) {
          throw new Error("Invalid email or password");
        }

        const ticketStatus = await getTicketStatus(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.fullName,
          role: user.role,
          ticketStatus,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user.id) return false;

      const profile = await loadUserAuthProfile(user.id);
      if (!profile?.isActive) return false;

      if (account?.provider && account.provider !== CREDENTIALS_PROVIDER) {
        await db
          .update(users)
          .set({
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            fullName: user.name ?? undefined,
            emailVerified:
              "emailVerified" in user && user.emailVerified
                ? new Date(user.emailVerified)
                : new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        const profile = await loadUserAuthProfile(user.id);
        if (profile) {
          token.id = profile.id;
          token.role = profile.role;
          token.ticketStatus = profile.ticketStatus;
        }
      }

      if (trigger === "update" && session) {
        if (session.role) token.role = session.role;
        if (session.ticketStatus !== undefined) {
          token.ticketStatus = session.ticketStatus;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.ticketStatus = token.ticketStatus as string | null;
      }
      return session;
    },
  },

  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await db
        .update(users)
        .set({
          fullName: user.name ?? user.email?.split("@")[0] ?? "User",
          name: user.name ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    },
  },

  trustHost: true,
});
