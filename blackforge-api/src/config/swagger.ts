import { API_BASE_PATH } from "@/config/constants";
import type { OpenApiFragment } from "@/docs/openapi/types";
import { authDocs } from "@/docs/openapi/auth.openapi";
import { usersDocs } from "@/docs/openapi/users.openapi";
import { catalogDocs } from "@/docs/openapi/catalog.openapi";

/** Module fragments merged into the base document below. */
const fragments: OpenApiFragment[] = [authDocs, usersDocs, catalogDocs];

/**
 * Base OpenAPI 3.1 document. Feature modules contribute path/tag/schema
 * fragments from `src/docs/openapi/`, merged in via `fragments` above.
 */
const baseDocument = {
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
};

/** Merge all module fragments into the base document. */
function buildDocument() {
  const doc = structuredClone(baseDocument) as typeof baseDocument & {
    tags: { name: string; description?: string }[];
    paths: Record<string, unknown>;
    components: { schemas: Record<string, unknown>; securitySchemes: Record<string, unknown> };
  };
  for (const f of fragments) {
    if (f.tags) doc.tags.push(...f.tags);
    if (f.paths) Object.assign(doc.paths, f.paths);
    if (f.schemas) Object.assign(doc.components.schemas, f.schemas);
  }
  return doc;
}

export const openApiDocument = buildDocument();
