import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton untuk Next.js Frontend & API Routes
 * Menghindari multiple instance saat Next.js Fast Refresh / Hot Reload
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
