import { type OpenApiFragment, okResponse, errorResponse, bearer } from "@/docs/openapi/types";

export const commerceDocs: OpenApiFragment = {
  tags: [
    { name: "Cart", description: "Guest + member cart (x-cart-id header for guests)" },
    { name: "Coupons", description: "Coupon validation + admin management" },
  ],
  paths: {
    "/cart": {
      get: {
        tags: ["Cart"],
        summary: "Get current cart",
        parameters: [
          { name: "x-cart-id", in: "header", required: false, schema: { type: "string" } },
        ],
        responses: { "200": okResponse() },
      },
    },
    "/cart/items": {
      post: { tags: ["Cart"], summary: "Add item to cart", responses: { "201": okResponse() } },
    },
    "/cart/items/{itemId}": {
      patch: {
        tags: ["Cart"],
        summary: "Set item quantity (0 removes)",
        parameters: [{ name: "itemId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse(), "404": errorResponse("Not found") },
      },
      delete: {
        tags: ["Cart"],
        summary: "Remove item",
        parameters: [{ name: "itemId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse() },
      },
    },
    "/cart/merge": {
      post: {
        tags: ["Cart"],
        summary: "Merge a guest cart into the member cart",
        security: bearer,
        responses: { "200": okResponse() },
      },
    },
    "/coupons/validate": {
      post: {
        tags: ["Coupons"],
        summary: "Validate a coupon against a subtotal",
        responses: { "200": okResponse(), "400": errorResponse("Invalid/expired") },
      },
    },
    "/coupons": {
      get: {
        tags: ["Coupons"],
        summary: "List coupons (admin)",
        security: bearer,
        responses: { "200": okResponse() },
      },
      post: {
        tags: ["Coupons"],
        summary: "Create coupon (admin)",
        security: bearer,
        responses: { "201": okResponse() },
      },
    },
  },
};
