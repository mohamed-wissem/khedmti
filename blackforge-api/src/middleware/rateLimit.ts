import { rateLimit, type Store } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { config } from "@/config";
import { isProduction } from "@/config/env";
import { redis } from "@/config/redis";
import { failure } from "@/utils/apiResponse";

/**
 * In production, back the limiter with Redis so limits are shared across
 * instances. In dev/test, use the default in-memory store (no Redis dependency).
 */
function makeStore(prefix: string): Store | undefined {
  if (!isProduction) return undefined;
  return new RedisStore({
    prefix,
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<never>,
  });
}

/** Baseline global limiter (health probes are exempt). */
export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore("rl:global:"),
  skip: (req) => req.path.startsWith("/health"),
  handler: (_req, res) => {
    res
      .status(429)
      .json(failure("Too many requests, please try again later.", "TOO_MANY_REQUESTS"));
  },
});

/** Stricter limiter for sensitive auth endpoints (login, register, reset). */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore("rl:auth:"),
  handler: (_req, res) => {
    res
      .status(429)
      .json(failure("Too many attempts, please try again later.", "TOO_MANY_REQUESTS"));
  },
});
