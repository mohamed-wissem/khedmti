import { Redis } from "ioredis";
import { config } from "@/config";
import { logger } from "@/utils/logger";

/**
 * Redis singleton (ioredis).
 *
 * `lazyConnect: true` means no socket is opened until the first command, so the
 * API process can boot even when Redis is temporarily unavailable — the
 * readiness probe (`/health/ready`) is what surfaces connectivity problems.
 */
export const redis = new Redis(config.redis.url, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy: (times) => Math.min(times * 200, 2000),
});

redis.on("error", (err) => {
  logger.error({ err }, "redis error");
});

redis.on("connect", () => {
  logger.info("redis connected");
});

/** Verify Redis connectivity for the readiness probe. */
export async function pingRedis(): Promise<boolean> {
  try {
    if (redis.status === "wait" || redis.status === "end") {
      await redis.connect();
    }
    const pong = await redis.ping();
    return pong === "PONG";
  } catch (err) {
    logger.error({ err }, "redis ping failed");
    return false;
  }
}

/** Close the Redis connection during graceful shutdown. */
export async function disconnectRedis(): Promise<void> {
  try {
    if (redis.status !== "end") {
      await redis.quit();
    }
  } catch (err) {
    logger.warn({ err }, "error while closing redis");
  }
}
