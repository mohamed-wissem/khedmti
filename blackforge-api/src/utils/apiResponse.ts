import type { Response } from "express";

/** Standard success envelope. */
export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: object;
}

/** Standard error envelope (matches the Sprint 0 spec). */
export interface ErrorEnvelope {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

/** Build a success envelope. */
export function success<T>(data: T, meta?: object): SuccessEnvelope<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}

/** Build an error envelope. */
export function failure(message: string, code: string, details?: unknown): ErrorEnvelope {
  const body: ErrorEnvelope = { success: false, message, code };
  if (details !== undefined) body.details = details;
  return body;
}

/** Send a success response with an HTTP status (default 200). */
export function sendSuccess<T>(res: Response, data: T, status = 200, meta?: object): Response {
  return res.status(status).json(success(data, meta));
}
