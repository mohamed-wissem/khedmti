import type { RequestHandler } from "express";
import { verifyAccessToken } from "@/utils/jwt";
import { AppError } from "@/utils/apiError";
import { findAuthContext } from "@/modules/auth/auth.repository";

/**
 * Require a valid Bearer access token. Loads the user's current role +
 * permissions from the database and attaches them as `req.user`.
 */
export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw AppError.unauthorized("Missing or malformed Authorization header");
    }

    const token = header.slice("Bearer ".length).trim();
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw AppError.unauthorized("Invalid or expired access token");
    }

    const ctx = await findAuthContext(payload.sub);
    if (!ctx) throw AppError.unauthorized("Account no longer exists");

    req.user = ctx;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Optional auth: attaches `req.user` when a valid token is present, but never
 * rejects the request. Useful for endpoints that behave differently for
 * guests vs. members (e.g. cart, checkout).
 */
export const optionalAuthenticate: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return next();
    const token = header.slice("Bearer ".length).trim();
    try {
      const payload = verifyAccessToken(token);
      const ctx = await findAuthContext(payload.sub);
      if (ctx) req.user = ctx;
    } catch {
      // ignore — treat as guest
    }
    next();
  } catch (err) {
    next(err);
  }
};
