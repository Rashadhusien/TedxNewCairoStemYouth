import type { DefaultSession } from "next-auth";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      fullName: string;
      email: string;
      image?: string | null;
      isActive: boolean;
      ticketStatus: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    isActive?: boolean;
    ticketStatus?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    fullName?: string;
    email?: string;
    image?: string | null;
    isActive?: boolean;
    ticketStatus?: string | null;
  }
}
