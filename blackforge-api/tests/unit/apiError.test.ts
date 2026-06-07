import { describe, it, expect } from "vitest";
import { AppError } from "@/utils/apiError";
import { success, failure } from "@/utils/apiResponse";

describe("AppError", () => {
  it("builds a 404 not-found error", () => {
    const err = AppError.notFound("nope");
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("nope");
    expect(err.isOperational).toBe(true);
  });

  it("marks internal errors as non-operational", () => {
    const err = AppError.internal();
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(false);
  });

  it("carries arbitrary details", () => {
    const err = AppError.badRequest("bad", { field: "email" });
    expect(err.details).toEqual({ field: "email" });
  });
});

describe("response envelopes", () => {
  it("success wraps data", () => {
    expect(success({ a: 1 })).toEqual({ success: true, data: { a: 1 } });
  });

  it("success includes meta when provided", () => {
    expect(success([], { total: 0 })).toEqual({ success: true, data: [], meta: { total: 0 } });
  });

  it("failure matches the standard error shape", () => {
    expect(failure("boom", "BOOM", { x: 1 })).toEqual({
      success: false,
      message: "boom",
      code: "BOOM",
      details: { x: 1 },
    });
  });

  it("failure omits details when undefined", () => {
    expect(failure("boom", "BOOM")).toEqual({ success: false, message: "boom", code: "BOOM" });
  });
});
