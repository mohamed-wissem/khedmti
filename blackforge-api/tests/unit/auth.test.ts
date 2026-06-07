import { describe, it, expect } from "vitest";
import { signAccessToken, verifyAccessToken } from "@/utils/jwt";
import { hashPassword, verifyPassword } from "@/utils/password";
import { hashToken, generateOpaqueToken, makeReferralCode } from "@/utils/token";
import { ROLES, ROLE_PERMISSIONS, ALL_PERMISSIONS } from "@/modules/rbac/permissions";

describe("jwt", () => {
  it("signs and verifies an access token round-trip", () => {
    const token = signAccessToken({ sub: "u1", email: "a@b.com", role: "CUSTOMER" });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe("u1");
    expect(payload.email).toBe("a@b.com");
    expect(payload.role).toBe("CUSTOMER");
  });

  it("rejects a tampered token", () => {
    expect(() => verifyAccessToken("not.a.jwt")).toThrow();
  });
});

describe("password", () => {
  it("hashes and verifies", async () => {
    const hash = await hashPassword("hunter2pass");
    expect(hash).not.toBe("hunter2pass");
    expect(await verifyPassword("hunter2pass", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("tokens", () => {
  it("hashes deterministically", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
  });
  it("generates unique opaque tokens", () => {
    expect(generateOpaqueToken()).not.toBe(generateOpaqueToken());
  });
  it("makes 6-char referral codes", () => {
    expect(makeReferralCode()).toMatch(/^[A-Z0-9]{6}$/);
  });
});

describe("rbac", () => {
  it("ADMIN has all permissions, CUSTOMER none", () => {
    expect(ROLE_PERMISSIONS[ROLES.ADMIN]).toEqual(ALL_PERMISSIONS);
    expect(ROLE_PERMISSIONS[ROLES.CUSTOMER]).toHaveLength(0);
  });
  it("STAFF is a non-empty subset of all permissions", () => {
    const staff = ROLE_PERMISSIONS[ROLES.STAFF];
    expect(staff.length).toBeGreaterThan(0);
    expect(staff.every((p) => ALL_PERMISSIONS.includes(p))).toBe(true);
  });
});
