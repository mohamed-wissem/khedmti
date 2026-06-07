import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

export interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Validate + coerce request parts against Zod schemas. Parsed results are placed
 * on `req.validated` (and the validated body is written back to `req.body`).
 * In Express 5, `req.query` is read-only, so downstream code should read the
 * coerced query from `req.validated.query`.
 *
 * A ZodError thrown here is turned into a 422 by the central error handler.
 */
export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req, _res, next) => {
    try {
      const validated: { body?: unknown; query?: unknown; params?: unknown } = {};
      if (schemas.body) {
        validated.body = schemas.body.parse(req.body);
        req.body = validated.body;
      }
      if (schemas.query) validated.query = schemas.query.parse(req.query);
      if (schemas.params) validated.params = schemas.params.parse(req.params);
      req.validated = validated;
      next();
    } catch (err) {
      next(err);
    }
  };
}
