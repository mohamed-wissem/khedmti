import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import hpp from "hpp";
import swaggerUi from "swagger-ui-express";

import { config } from "@/config";
import { openApiDocument } from "@/config/swagger";
import { API_BASE_PATH } from "@/config/constants";
import { requestContext } from "@/middleware/requestContext";
import { globalRateLimiter } from "@/middleware/rateLimit";
import { notFound } from "@/middleware/notFound";
import { errorHandler } from "@/middleware/errorHandler";
import { healthRouter } from "@/modules/health/health.routes";
import { apiRouter } from "@/routes";

/**
 * Builds the Express application (middleware + routes). Deliberately does NOT
 * call `listen` so it can be imported directly by tests (supertest).
 */
export function createApp(): Express {
  const app = express();

  // Trust the first proxy hop (correct client IPs behind a load balancer).
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // ── Observability ─────────────────────────────────────────────────────────
  app.use(requestContext);

  // ── Security & performance baseline ───────────────────────────────────────
  app.use(
    helmet({
      // The API serves JSON + Swagger UI; allow the docs assets to load.
      contentSecurityPolicy: config.isProduction ? undefined : false,
      crossOriginEmbedderPolicy: false,
      hsts: config.isProduction ? { maxAge: 15552000, includeSubDomains: true } : false,
    })
  );
  app.use(
    cors({
      origin: config.cors.origins === "*" ? true : config.cors.origins,
      credentials: true,
    })
  );
  app.use(compression());

  // ── Body parsing with size limits ─────────────────────────────────────────
  // Capture the raw body so the Stripe webhook can verify its signature.
  app.use(
    express.json({
      limit: config.server.bodyLimit,
      verify: (req, _res, buf) => {
        (req as express.Request).rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: config.server.bodyLimit }));

  // Guard against HTTP parameter pollution (after body parsing).
  app.use(hpp());

  // ── Rate limiting ─────────────────────────────────────────────────────────
  app.use(globalRateLimiter);

  // ── Health probes (top-level so infra can reach them without the API prefix) ─
  app.use("/health", healthRouter);

  // ── API docs ──────────────────────────────────────────────────────────────
  app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  // ── Versioned API ─────────────────────────────────────────────────────────
  app.use(API_BASE_PATH, apiRouter);

  // ── 404 + central error handler (must be last) ────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
