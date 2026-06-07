import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wrap an async route handler so rejected promises are forwarded to Express's
 * error middleware instead of crashing the process. (Express 5 forwards async
 * rejections natively, but this keeps handlers explicit and version-agnostic.)
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
