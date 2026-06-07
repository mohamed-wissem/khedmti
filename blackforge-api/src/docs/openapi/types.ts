/** Shape of a per-module OpenAPI fragment that gets merged into the base doc. */
export interface OpenApiFragment {
  tags?: { name: string; description?: string }[];
  paths?: Record<string, unknown>;
  schemas?: Record<string, unknown>;
}

/** Convenience: a JSON-ref to a reusable error response. */
export const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } },
});

export const okResponse = (description = "Success") => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessEnvelope" } } },
});

export const bearer = [{ bearerAuth: [] as string[] }];
