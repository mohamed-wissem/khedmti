import { randomBytes, createHash } from "node:crypto";

/** Generate a cryptographically-random, URL-safe opaque token. */
export function generateOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Deterministic SHA-256 hash — opaque tokens are stored hashed, never raw. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Short, human-friendly, URL-safe referral code (ported from the storefront). */
export function makeReferralCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join("");
}
