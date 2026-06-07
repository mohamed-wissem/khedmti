import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "@/config";
import type { AccessTokenPayload } from "@/modules/auth/auth.types";

/** Sign a short-lived access token. */
export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.accessTtl as unknown as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, config.jwt.accessSecret, options);
}

/** Verify & decode an access token. Throws if invalid/expired. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, config.jwt.accessSecret);
  if (typeof decoded === "string") {
    throw new Error("Unexpected token payload");
  }
  return decoded as AccessTokenPayload;
}
