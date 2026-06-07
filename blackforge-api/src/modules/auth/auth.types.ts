/** Authenticated principal attached to `req.user` by the `authenticate` middleware. */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

/** Payload embedded in the short-lived access JWT. */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
}

/** Token bundle returned to clients on login/register/refresh. */
export interface TokenPair {
  tokenType: "Bearer";
  accessToken: string;
  refreshToken: string;
  accessTtl: string;
}

/** User shape safe to return over the API (never includes passwordHash). */
export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  emailVerified: boolean;
  xp: number;
  level: number;
  creditCents: number;
  referralCode: string | null;
  createdAt: Date;
}
