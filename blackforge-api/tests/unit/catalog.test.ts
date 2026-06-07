import { describe, it, expect } from "vitest";
import { slugify } from "@/utils/slug";
import { getPageQuery, pageMeta } from "@/utils/pagination";

describe("slugify", () => {
  it("lowercases and dashes", () => {
    expect(slugify("Elden Ring: Shadow!")).toBe("elden-ring-shadow");
  });
  it("trims leading/trailing separators", () => {
    expect(slugify("  --Hello-- ")).toBe("hello");
  });
  it("strips diacritics", () => {
    expect(slugify("Pokémon Légendes")).toBe("pokemon-legendes");
  });
});

describe("pagination", () => {
  it("computes skip/take with defaults", () => {
    expect(getPageQuery()).toEqual({ page: 1, limit: 20, skip: 0, take: 20 });
  });
  it("clamps limit to 100 and page to >=1", () => {
    expect(getPageQuery({ page: 0, limit: 500 })).toMatchObject({ page: 1, limit: 100 });
    expect(getPageQuery({ page: 3, limit: 10 })).toMatchObject({ skip: 20, take: 10 });
  });
  it("builds page meta", () => {
    expect(pageMeta(45, 2, 20)).toEqual({ total: 45, page: 2, limit: 20, totalPages: 3 });
    expect(pageMeta(0, 1, 20).totalPages).toBe(1);
  });
});
