import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role?: "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT" | "GUARDIAN";
  }

  interface Session {
    user: {
      role?: "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT" | "GUARDIAN";
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT" | "GUARDIAN";
  }
}
