import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "@/utils/apiError";
import { failure } from "@/utils/apiResponse";
import { isProduction } from "@/config/env";
import { logger } from "@/utils/logger";

/**
 * Central error handler. Converts any thrown value into the standard error
 * envelope: { success, message, code, details }.
 *
 * Must be the LAST middleware registered, and must keep the 4-arg signature so
 * Express recognizes it as an error handler.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  // Per-request logger if available, else the root logger.
  const log = (req as Request & { log?: typeof logger }).log ?? logger;

  // 1. Zod validation errors → 422 with field details.
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    res.status(422).json(failure("Validation failed", "VALIDATION_ERROR", details));
    return;
  }

  // 2. Known operational errors.
  if (err instanceof AppError) {
    if (!err.isOperational || err.statusCode >= 500) {
      log.error({ err }, err.message);
    } else {
      log.warn({ code: err.code, statusCode: err.statusCode }, err.message);
    }
    res.status(err.statusCode).json(failure(err.message, err.code, err.details));
    return;
  }

  // 3. Anything else → opaque 500 (never leak internals in production).
  const message = err instanceof Error ? err.message : "Unknown error";
  log.error({ err }, "unhandled error");
  res
    .status(500)
    .json(
      failure(
        isProduction ? "Internal server error" : message,
        "INTERNAL_ERROR",
        isProduction ? undefined : { stack: err instanceof Error ? err.stack : undefined }
      )
    );
}
