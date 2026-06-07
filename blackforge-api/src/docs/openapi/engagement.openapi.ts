import { type OpenApiFragment, okResponse, errorResponse, bearer } from "@/docs/openapi/types";

export const engagementDocs: OpenApiFragment = {
  tags: [
    { name: "Reviews", description: "Product reviews + moderation" },
    { name: "Gamification", description: "XP, levels, daily rewards, referrals" },
  ],
  paths: {
    "/reviews/product/{slug}": {
      get: {
        tags: ["Reviews"],
        summary: "Approved reviews for a product",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse() },
      },
    },
    "/reviews": {
      post: {
        tags: ["Reviews"],
        summary: "Create a review (verified purchasers only)",
        security: bearer,
        responses: {
          "201": okResponse("Created (pending moderation)"),
          "403": errorResponse("Not a purchaser"),
          "409": errorResponse("Already reviewed"),
        },
      },
    },
    "/reviews/pending": {
      get: {
        tags: ["Reviews"],
        summary: "Moderation queue",
        security: bearer,
        responses: { "200": okResponse() },
      },
    },
    "/reviews/{id}": {
      patch: {
        tags: ["Reviews"],
        summary: "Edit my review (returns to pending)",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse() },
      },
      delete: {
        tags: ["Reviews"],
        summary: "Delete a review (owner or moderator)",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse() },
      },
    },
    "/reviews/{id}/moderate": {
      patch: {
        tags: ["Reviews"],
        summary: "Approve/reject a review (moderator)",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse() },
      },
    },
    "/users/me/gamification": {
      get: {
        tags: ["Gamification"],
        summary: "My XP/level/rank/credit/achievements",
        security: bearer,
        responses: { "200": okResponse() },
      },
    },
    "/users/me/daily-claim": {
      post: {
        tags: ["Gamification"],
        summary: "Claim the daily reward",
        security: bearer,
        responses: { "200": okResponse(), "400": errorResponse("Already claimed") },
      },
    },
    "/users/me/referral": {
      get: {
        tags: ["Gamification"],
        summary: "My referral code + stats",
        security: bearer,
        responses: { "200": okResponse() },
      },
    },
  },
};
