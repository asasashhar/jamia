import { PrismaClient } from "@/generated/prisma";
import { ensureDatabaseInitialized } from "./db-init";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

// Auto-initialize SQLite database if not yet created or tables missing
ensureDatabaseInitialized();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let client: PrismaClient;
try {
  client = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
} catch {
  console.warn('[AI Studio] Database not connected — using mock');
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d?: { data?: unknown }) => d?.data ?? {},
    update: async (d?: { data?: unknown }) => d?.data ?? {},
    delete: async () => ({}),
    count: async () => 0,
    upsert: async (d?: { create?: unknown }) => d?.create ?? {},
  };
  client = new Proxy({}, {
    get: () => new Proxy({}, { get: () => noOp }),
  }) as unknown as PrismaClient;
}

export const prisma = client;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
