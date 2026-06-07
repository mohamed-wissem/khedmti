import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "@/app";

const app = createApp();

describe("docs", () => {
  it("serves the OpenAPI document with feature paths", async () => {
    const res = await request(app).get("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.1.0");
    expect(res.body.paths["/auth/login"]).toBeDefined();
    expect(res.body.paths["/orders"]).toBeDefined();
    expect(res.body.paths["/admin/users"]).toBeDefined();
  });
});

describe("security headers", () => {
  it("sets helmet hardening headers", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});
