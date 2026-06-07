import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeOptional } from "@/utils/sanitize";

describe("sanitizeText", () => {
  it("strips script tags and markup", () => {
    expect(sanitizeText("<script>alert(1)</script>hello")).toBe("hello");
    expect(sanitizeText("<b>bold</b> text")).toBe("bold text");
  });
  it("trims whitespace", () => {
    expect(sanitizeText("  spaced  ")).toBe("spaced");
  });
  it("preserves undefined for optional fields", () => {
    expect(sanitizeOptional(undefined)).toBeUndefined();
    expect(sanitizeOptional("<i>x</i>")).toBe("x");
  });
});
