import { PrismaClient } from "@prisma/client";
import { isProduction } from "@/config/env";
import { logger } from "@/utils/logger";

/**
 * PrismaClient singleton.
 *
 * In development the module can be re-evaluated on hot-reload, which would spawn
 * a new client (and a new connection pool) each time. Caching it on `globalThis`
 * prevents connection exhaustion.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProduction ? ["warn", "error"] : ["query", "warn", "error"],
  });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}

/** Verify database connectivity for the readiness probe (no models required). */
export async function pingDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    logger.error({ err }, "database ping failed");
    return false;
  }
}

/** Disconnect Prisma during graceful shutdown. */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (err) {
    logger.warn({ err }, "error while disconnecting prisma");
  }
}
