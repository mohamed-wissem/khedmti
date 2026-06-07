import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "@/app";

const app = createApp();

describe("health endpoints", () => {
  it("GET /health returns a success envelope", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
    expect(typeof res.body.data.uptime).toBe("number");
  });

  it("GET /health/live returns 200", async () => {
    const res = await request(app).get("/health/live");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
  });

  it("sets an x-request-id response header", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-request-id"]).toBeDefined();
  });
});

describe("api root + 404", () => {
  it("GET /api/v1 returns service info", async () => {
    const res = await request(app).get("/api/v1");
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("BLACKFORGE API");
  });

  it("unknown route returns a 404 error envelope", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      code: "NOT_FOUND",
    });
    expect(typeof res.body.message).toBe("string");
  });
});
