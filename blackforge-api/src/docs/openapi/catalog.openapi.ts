import { type OpenApiFragment, okResponse, errorResponse, bearer } from "@/docs/openapi/types";

const q = (name: string, description: string) => ({
  name,
  in: "query",
  required: false,
  schema: { type: "string" },
  description,
});

export const catalogDocs: OpenApiFragment = {
  tags: [
    { name: "Products", description: "Catalog browsing + admin product management" },
    { name: "Categories", description: "Category tree" },
    { name: "Brands", description: "Brands" },
    { name: "Search", description: "Full-text search + typeahead" },
    { name: "Wishlist", description: "Member wishlist" },
  ],
  paths: {
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List products (filter, sort, paginate)",
        parameters: [
          q("category", "Category slug"),
          q("brand", "Brand slug"),
          q("platform", "Platform"),
          q("rarity", "COMMON | PREMIUM | LEGENDARY"),
          q("minPrice", "Min price in cents"),
          q("maxPrice", "Max price in cents"),
          q("sort", "popular | newest | price-asc | price-desc | rating"),
          q("q", "Keyword"),
          q("page", "Page (default 1)"),
          q("limit", "Page size (default 20, max 100)"),
        ],
        responses: { "200": okResponse() },
      },
      post: {
        tags: ["Products"],
        summary: "Create a product",
        security: bearer,
        responses: { "201": okResponse("Created"), "403": errorResponse("Forbidden") },
      },
    },
    "/products/{slug}": {
      get: {
        tags: ["Products"],
        summary: "Product detail (variants, images, specs)",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse(), "404": errorResponse("Not found") },
      },
    },
    "/products/{slug}/related": {
      get: {
        tags: ["Products"],
        summary: "Related products (same category)",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse() },
      },
    },
    "/products/{id}/images": {
      post: {
        tags: ["Products"],
        summary: "Upload product images (multipart, field 'images')",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  images: { type: "array", items: { type: "string", format: "binary" } },
                },
              },
            },
          },
        },
        responses: { "201": okResponse("Uploaded"), "403": errorResponse("Forbidden") },
      },
    },
    "/categories": {
      get: { tags: ["Categories"], summary: "Category tree", responses: { "200": okResponse() } },
      post: {
        tags: ["Categories"],
        summary: "Create category",
        security: bearer,
        responses: { "201": okResponse("Created") },
      },
    },
    "/brands": {
      get: { tags: ["Brands"], summary: "List brands", responses: { "200": okResponse() } },
      post: {
        tags: ["Brands"],
        summary: "Create brand",
        security: bearer,
        responses: { "201": okResponse("Created") },
      },
    },
    "/search": {
      get: {
        tags: ["Search"],
        summary: "Full-text product search",
        parameters: [q("q", "Query"), q("page", "Page"), q("limit", "Page size")],
        responses: { "200": okResponse() },
      },
    },
    "/search/suggest": {
      get: {
        tags: ["Search"],
        summary: "Typeahead suggestions",
        parameters: [q("q", "Query")],
        responses: { "200": okResponse() },
      },
    },
    "/users/me/wishlist": {
      get: {
        tags: ["Wishlist"],
        summary: "List my wishlist",
        security: bearer,
        responses: { "200": okResponse() },
      },
    },
    "/users/me/wishlist/{productId}": {
      post: {
        tags: ["Wishlist"],
        summary: "Add to wishlist",
        security: bearer,
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "201": okResponse() },
      },
      delete: {
        tags: ["Wishlist"],
        summary: "Remove from wishlist",
        security: bearer,
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": okResponse() },
      },
    },
  },
};
