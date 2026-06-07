import { type OpenApiFragment, okResponse, errorResponse, bearer } from "@/docs/openapi/types";

export const usersDocs: OpenApiFragment = {
  tags: [{ name: "Users", description: "Profile, password, addresses" }],
  paths: {
    "/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get my profile",
        security: bearer,
        responses: { "200": okResponse(), "401": errorResponse("Unauthorized") },
      },
      patch: {
        tags: ["Users"],
        summary: "Update my profile (name, image)",
        security: bearer,
        responses: { "200": okResponse(), "401": errorResponse("Unauthorized") },
      },
    },
    "/users/me/change-password": {
      post: {
        tags: ["Users"],
        summary: "Change my password",
        security: bearer,
        responses: { "200": okResponse(), "400": errorResponse("Wrong current password") },
      },
    },
    "/users/me/addresses": {
      get: {
        tags: ["Users"],
        summary: "List my addresses",
        security: bearer,
        responses: { "200": okResponse() },
      },
      post: {
        tags: ["Users"],
        summary: "Add an address",
        security: bearer,
        responses: { "201": okResponse("Created") },
      },
    },
    "/users/me/addresses/{id}": {
      patch: {
        tags: ["Users"],
        summary: "Update an address",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse(), "404": errorResponse("Not found") },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete an address",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse(), "404": errorResponse("Not found") },
      },
    },
  },
};
