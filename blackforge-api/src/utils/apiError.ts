/**
 * Operational application error. Anything thrown as an `AppError` is considered
 * a known/expected condition and is rendered to the client via the standard
 * error envelope. Unknown throwables become a generic 500.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    code = "ERROR",
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace?.(this, this.constructor);
  }

  // ── Common factories ──────────────────────────────────────────────────────
  static badRequest(message = "Bad request", details?: unknown): AppError {
    return new AppError(400, message, "BAD_REQUEST", details);
  }

  static unauthorized(message = "Unauthorized", details?: unknown): AppError {
    return new AppError(401, message, "UNAUTHORIZED", details);
  }

  static forbidden(message = "Forbidden", details?: unknown): AppError {
    return new AppError(403, message, "FORBIDDEN", details);
  }

  static notFound(message = "Resource not found", details?: unknown): AppError {
    return new AppError(404, message, "NOT_FOUND", details);
  }

  static conflict(message = "Conflict", details?: unknown): AppError {
    return new AppError(409, message, "CONFLICT", details);
  }

  static unprocessable(message = "Unprocessable entity", details?: unknown): AppError {
    return new AppError(422, message, "UNPROCESSABLE_ENTITY", details);
  }

  static tooManyRequests(message = "Too many requests", details?: unknown): AppError {
    return new AppError(429, message, "TOO_MANY_REQUESTS", details);
  }

  static internal(message = "Internal server error", details?: unknown): AppError {
    return new AppError(500, message, "INTERNAL_ERROR", details, false);
  }

  static serviceUnavailable(message = "Service unavailable", details?: unknown): AppError {
    return new AppError(503, message, "SERVICE_UNAVAILABLE", details);
  }
}
