import rateLimit from "express-rate-limit";
import { config } from "@/config";
import { failure } from "@/utils/apiResponse";

/**
 * Baseline global rate limiter. Per-route stricter buckets (e.g. on /auth) and a
 * Redis-backed store for multi-instance deployments are added in later sprints.
 */
export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  // Don't rate-limit health probes (load balancers hit them frequently).
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
  handler: (_req, res) => {
    res
      .status(429)
      .json(failure("Too many attempts, please try again later.", "TOO_MANY_REQUESTS"));
  },
});
