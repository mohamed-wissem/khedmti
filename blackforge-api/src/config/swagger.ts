import { API_BASE_PATH } from "@/config/constants";

/**
 * Base OpenAPI 3.1 document. Feature modules will contribute their own path and
 * schema fragments (from `src/docs/openapi/`) in later sprints — those get merged
 * into `paths` / `components.schemas` here. For Sprint 0 only the health checks
 * and the shared error/success schemas are documented.
 */
export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "BLACKFORGE API",
    version: "0.1.0",
    description:
      "Backend API powering the BLACKFORGE storefront. Sprint 0 foundation: health, errors, security, observability. Feature endpoints arrive in later sprints.",
  },
  servers: [{ url: API_BASE_PATH, description: "API v1" }],
  tags: [{ name: "Health", description: "Liveness & readiness probes" }],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Service health summary",
        responses: {
          "200": {
            description: "Service is up",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessEnvelope" },
              },
            },
          },
        },
      },
    },
    "/health/live": {
      get: {
        tags: ["Health"],
        summary: "Liveness probe",
        responses: { "200": { description: "Process is alive" } },
      },
    },
    "/health/ready": {
      get: {
        tags: ["Health"],
        summary: "Readiness probe (checks database + redis)",
        responses: {
          "200": { description: "All dependencies reachable" },
          "503": { description: "One or more dependencies are down" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      SuccessEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", const: true },
          data: { type: "object" },
          meta: { type: "object", nullable: true },
        },
        required: ["success", "data"],
      },
      ErrorEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", const: false },
          message: { type: "string" },
          code: { type: "string" },
          details: { nullable: true },
        },
        required: ["success", "message", "code"],
      },
    },
  },
} as const;
