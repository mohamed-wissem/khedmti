/**
 * Global test bootstrap. Runs before any test file, so environment validation in
 * `src/config/env.ts` sees valid values (otherwise it would exit the process).
 */
process.env.NODE_ENV = "test";
process.env.PORT = process.env.PORT ?? "4000";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://test:test@localhost:5432/test?schema=bfapi";
process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-access-secret-at-least-16";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "test-refresh-secret-16chars";
