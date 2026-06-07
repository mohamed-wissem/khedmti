import { type OpenApiFragment, okResponse, errorResponse, bearer } from "@/docs/openapi/types";

export const adminDocs: OpenApiFragment = {
  tags: [{ name: "Admin", description: "User management, analytics, inventory, audit logs" }],
  paths: {
    "/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List/search users",
        security: bearer,
        responses: { "200": okResponse(), "403": errorResponse("Forbidden") },
      },
    },
    "/admin/users/{id}/role": {
      patch: {
        tags: ["Admin"],
        summary: "Change a user's role",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse() },
      },
    },
    "/admin/analytics/sales": {
      get: {
        tags: ["Admin"],
        summary: "Sales analytics (revenue, AOV, top products, time series)",
        security: bearer,
        responses: { "200": okResponse() },
      },
    },
    "/admin/analytics/inventory": {
      get: {
        tags: ["Admin"],
        summary: "Low-stock inventory monitor",
        security: bearer,
        responses: { "200": okResponse() },
      },
    },
    "/admin/audit-logs": {
      get: {
        tags: ["Admin"],
        summary: "Browse audit logs",
        security: bearer,
        responses: { "200": okResponse() },
      },
    },
  },
};
