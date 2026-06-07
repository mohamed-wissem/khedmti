/** Static, non-secret configuration constants. */

export const API_PREFIX = "/api";
export const API_VERSION = "v1";
export const API_BASE_PATH = `${API_PREFIX}/${API_VERSION}`;

/** Max JSON / urlencoded request body size. */
export const BODY_LIMIT = "1mb";

/** Default rate-limit window + max requests (baseline; tighter buckets per-route later). */
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX = 300;

/** Graceful shutdown grace period before forcing exit. */
export const SHUTDOWN_TIMEOUT_MS = 10_000;
