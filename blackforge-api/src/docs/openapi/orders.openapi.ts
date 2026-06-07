import { type OpenApiFragment, okResponse, errorResponse, bearer } from "@/docs/openapi/types";

export const ordersDocs: OpenApiFragment = {
  tags: [
    { name: "Orders", description: "Checkout, history, tracking, cancellation, admin" },
    { name: "Payments", description: "Stripe intents, webhook, history, refunds" },
  ],
  paths: {
    "/orders": {
      post: {
        tags: ["Orders"],
        summary: "Create an order from the cart (server re-prices)",
        description: "Members use Bearer auth; guests pass the x-cart-id header and an email.",
        responses: { "201": okResponse("Order created (+ Stripe clientSecret when live)") },
      },
      get: {
        tags: ["Orders"],
        summary: "My order history",
        security: bearer,
        responses: { "200": okResponse() },
      },
    },
    "/orders/all": {
      get: {
        tags: ["Orders"],
        summary: "All orders (staff)",
        security: bearer,
        responses: { "200": okResponse(), "403": errorResponse("Forbidden") },
      },
    },
    "/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Order detail (owner or staff)",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse(), "404": errorResponse("Not found") },
      },
    },
    "/orders/{id}/track": {
      get: {
        tags: ["Orders"],
        summary: "Order status + tracking",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse() },
      },
    },
    "/orders/{id}/cancel": {
      post: {
        tags: ["Orders"],
        summary: "Cancel a pending order",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse(), "400": errorResponse("Not cancellable") },
      },
    },
    "/orders/{id}/status": {
      patch: {
        tags: ["Orders"],
        summary: "Update order status (staff)",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse() },
      },
    },
    "/payments/intent": {
      post: {
        tags: ["Payments"],
        summary: "Create a Stripe PaymentIntent for an order",
        security: bearer,
        responses: { "201": okResponse(), "503": errorResponse("Stripe not configured") },
      },
    },
    "/payments/webhook": {
      post: {
        tags: ["Payments"],
        summary: "Stripe webhook (signature-verified, raw body)",
        responses: { "200": okResponse("Received") },
      },
    },
    "/payments/history": {
      get: {
        tags: ["Payments"],
        summary: "My payment history",
        security: bearer,
        responses: { "200": okResponse() },
      },
    },
    "/payments/{orderId}/refund": {
      post: {
        tags: ["Payments"],
        summary: "Refund an order (admin)",
        security: bearer,
        parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse(), "400": errorResponse("Nothing to refund") },
      },
    },
  },
};
