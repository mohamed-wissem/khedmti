import { randomUUID } from "node:crypto";
import { pinoHttp } from "pino-http";
import { logger } from "@/utils/logger";

/**
 * Attaches a request id (honoring an inbound `x-request-id`) and logs every
 * request/response via pino-http. The per-request child logger is available as
 * `req.log` downstream.
 */
export const requestContext = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const incoming = req.headers["x-request-id"];
    const id = (Array.isArray(incoming) ? incoming[0] : incoming) ?? randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  // Health probes are noisy; keep them at debug.
  autoLogging: {
    ignore: (req) => req.url === "/health" || req.url === "/health/live",
  },
});
