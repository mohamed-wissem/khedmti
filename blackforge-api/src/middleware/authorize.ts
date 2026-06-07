import type { RequestHandler } from "express";
import { AppError } from "@/utils/apiError";

/** Require the authenticated user to have one of the given roles. */
export function requireRole(...roles: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden("Insufficient role"));
    }
    next();
  };
}

/** Require the authenticated user to hold ALL of the given permission keys. */
export function requirePermission(...permissions: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    const has = permissions.every((p) => req.user!.permissions.includes(p));
    if (!has) return next(AppError.forbidden("Insufficient permissions"));
    next();
  };
}
