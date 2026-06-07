import { type OpenApiFragment, okResponse, errorResponse, bearer } from "@/docs/openapi/types";

const jsonBody = (props: Record<string, unknown>, required: string[]) => ({
  required: true,
  content: {
    "application/json": { schema: { type: "object", properties: props, required } },
  },
});

export const authDocs: OpenApiFragment = {
  tags: [{ name: "Auth", description: "Registration, login, tokens, password reset, OAuth" }],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new account",
        requestBody: jsonBody(
          {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            referralCode: { type: "string" },
          },
          ["name", "email", "password"]
        ),
        responses: { "201": okResponse("Created"), "409": errorResponse("Email taken") },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in with email + password",
        requestBody: jsonBody({ email: { type: "string" }, password: { type: "string" } }, [
          "email",
          "password",
        ]),
        responses: { "200": okResponse(), "401": errorResponse("Invalid credentials") },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Rotate refresh token → new token pair",
        requestBody: jsonBody({ refreshToken: { type: "string" } }, ["refreshToken"]),
        responses: { "200": okResponse(), "401": errorResponse("Invalid/expired/reused") },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Revoke a refresh token",
        requestBody: jsonBody({ refreshToken: { type: "string" } }, ["refreshToken"]),
        responses: { "200": okResponse() },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request a password reset email",
        requestBody: jsonBody({ email: { type: "string" } }, ["email"]),
        responses: { "200": okResponse() },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password with a token",
        requestBody: jsonBody({ token: { type: "string" }, password: { type: "string" } }, [
          "token",
          "password",
        ]),
        responses: { "200": okResponse(), "400": errorResponse("Invalid/expired token") },
      },
    },
    "/auth/verify-email": {
      post: {
        tags: ["Auth"],
        summary: "Verify email with a token",
        requestBody: jsonBody({ token: { type: "string" } }, ["token"]),
        responses: { "200": okResponse(), "400": errorResponse("Invalid/expired token") },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Current auth principal (id, role, permissions)",
        security: bearer,
        responses: { "200": okResponse(), "401": errorResponse("Unauthorized") },
      },
    },
    "/auth/google": {
      get: {
        tags: ["Auth"],
        summary: "Start Google OAuth",
        responses: { "302": { description: "Redirect to Google" } },
      },
    },
    "/auth/google/callback": {
      get: { tags: ["Auth"], summary: "Google OAuth callback", responses: { "200": okResponse() } },
    },
  },
};
