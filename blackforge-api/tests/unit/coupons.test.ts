import { describe, it, expect } from "vitest";
import { computeDiscount } from "@/modules/coupons/coupons.service";

describe("computeDiscount", () => {
  it("applies a percentage discount (floored)", () => {
    expect(computeDiscount("PERCENT", 10, 5999)).toBe(599);
    expect(computeDiscount("PERCENT", 100, 5000)).toBe(5000);
  });

  it("applies a fixed discount", () => {
    expect(computeDiscount("FIXED", 500, 5999)).toBe(500);
  });

  it("never exceeds the subtotal", () => {
    expect(computeDiscount("FIXED", 9999, 5000)).toBe(5000);
    expect(computeDiscount("PERCENT", 100, 0)).toBe(0);
  });
});
