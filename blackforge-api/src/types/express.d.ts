import type { AuthUser } from "@/modules/auth/auth.types";

// Augment Express's Request with our auth principal and validated payloads.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
