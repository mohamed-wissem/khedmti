import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/apiError";

/** Catch-all for unmatched routes → forwards a 404 AppError to the error handler. */
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
