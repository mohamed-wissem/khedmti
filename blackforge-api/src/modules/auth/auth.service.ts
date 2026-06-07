import { config } from "@/config";
import { AppError } from "@/utils/apiError";
import { signAccessToken } from "@/utils/jwt";
import { hashPassword, verifyPassword } from "@/utils/password";
import { generateOpaqueToken, hashToken, makeReferralCode } from "@/utils/token";
import { logger } from "@/utils/logger";
import { ROLES } from "@/modules/rbac/permissions";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/services/email.service";
import { recordAudit } from "@/services/audit.service";
import * as repo from "@/modules/auth/auth.repository";
import { toPublicUser } from "@/modules/users/user.mapper";
import type { AccessTokenPayload, PublicUser, TokenPair } from "@/modules/auth/auth.types";

const DAY_MS = 24 * 60 * 60 * 1000;
const VERIFY_TTL_MS = DAY_MS;
const RESET_TTL_MS = 60 * 60 * 1000;

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

/** Mint an access JWT + a rotating opaque refresh token (stored hashed). */
async function createTokenPair(
  payload: AccessTokenPayload,
  meta: RequestMeta
): Promise<{ pair: TokenPair; refreshId: string }> {
  const accessToken = signAccessToken(payload);
  const refreshToken = generateOpaqueToken();
  const row = await repo.createRefreshToken({
    userId: payload.sub,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + config.jwt.refreshTtlDays * DAY_MS),
    ip: meta.ip,
    userAgent: meta.userAgent,
  });
  return {
    pair: { tokenType: "Bearer", accessToken, refreshToken, accessTtl: config.jwt.accessTtl },
    refreshId: row.id,
  };
}

export interface AuthResult {
  user: PublicUser;
  tokens: TokenPair;
}

export async function register(
  input: { name: string; email: string; password: string; referralCode?: string },
  meta: RequestMeta
): Promise<AuthResult> {
  const existing = await repo.findUserByEmail(input.email);
  if (existing) throw AppError.conflict("An account with that email already exists");

  const customerRole = await repo.findRoleByName(ROLES.CUSTOMER);
  if (!customerRole) {
    throw AppError.internal("CUSTOMER role missing — run `npm run prisma:seed`");
  }

  let referredById: string | undefined;
  if (input.referralCode) {
    const referrer = await repo.findUserByReferralCode(input.referralCode);
    if (referrer) referredById = referrer.id;
  }

  const passwordHash = await hashPassword(input.password);
  const user = await repo.createUser({
    name: input.name,
    email: input.email,
    passwordHash,
    referralCode: makeReferralCode(),
    role: { connect: { id: customerRole.id } },
    ...(referredById ? { referredBy: { connect: { id: referredById } } } : {}),
  });

  await issueEmailVerification(user.id, user.email);
  const { pair } = await createTokenPair(
    { sub: user.id, email: user.email, role: ROLES.CUSTOMER },
    meta
  );
  await recordAudit({ userId: user.id, action: "auth.register", ...meta });

  return { user: toPublicUser(user, ROLES.CUSTOMER), tokens: pair };
}

export async function login(
  input: { email: string; password: string },
  meta: RequestMeta
): Promise<AuthResult> {
  const user = await repo.findUserByEmail(input.email);
  if (!user?.passwordHash) throw AppError.unauthorized("Invalid email or password");

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw AppError.unauthorized("Invalid email or password");

  const ctx = await repo.findAuthContext(user.id);
  const role = ctx?.role ?? ROLES.CUSTOMER;
  const { pair } = await createTokenPair({ sub: user.id, email: user.email, role }, meta);
  await recordAudit({ userId: user.id, action: "auth.login", ...meta });

  return { user: toPublicUser(user, role), tokens: pair };
}

export async function refresh(rawToken: string, meta: RequestMeta): Promise<TokenPair> {
  const row = await repo.findRefreshTokenByHash(hashToken(rawToken));
  if (!row) throw AppError.unauthorized("Invalid refresh token");

  // Reuse of an already-revoked token ⇒ likely theft ⇒ nuke the whole family.
  if (row.revokedAt) {
    await repo.revokeAllUserRefreshTokens(row.userId);
    logger.warn({ userId: row.userId }, "refresh token reuse detected — revoked all sessions");
    throw AppError.unauthorized("Refresh token reuse detected");
  }
  if (row.expiresAt.getTime() < Date.now()) {
    throw AppError.unauthorized("Refresh token expired");
  }

  const ctx = await repo.findAuthContext(row.userId);
  if (!ctx) throw AppError.unauthorized("Account no longer exists");

  const { pair, refreshId } = await createTokenPair(
    { sub: ctx.id, email: ctx.email, role: ctx.role },
    meta
  );
  await repo.revokeRefreshToken(row.id, refreshId);
  return pair;
}

export async function logout(rawToken: string): Promise<void> {
  const row = await repo.findRefreshTokenByHash(hashToken(rawToken));
  if (row && !row.revokedAt) await repo.revokeRefreshToken(row.id);
}

async function issueEmailVerification(userId: string, email: string): Promise<void> {
  const token = generateOpaqueToken();
  await repo.createVerificationToken({
    userId,
    type: "EMAIL_VERIFY",
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
  });
  await sendVerificationEmail(email, token);
}

export async function resendVerification(userId: string): Promise<void> {
  const user = await repo.findUserById(userId);
  if (!user || user.emailVerified) return;
  await issueEmailVerification(user.id, user.email);
}

export async function verifyEmail(rawToken: string): Promise<void> {
  const row = await repo.findValidVerificationToken(hashToken(rawToken), "EMAIL_VERIFY");
  if (!row) throw AppError.badRequest("Invalid or expired verification token");
  await repo.setEmailVerified(row.userId);
  await repo.consumeVerificationToken(row.id);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await repo.findUserByEmail(email);
  // Always succeed (no account enumeration).
  if (!user) return;
  const token = generateOpaqueToken();
  await repo.createVerificationToken({
    userId: user.id,
    type: "PASSWORD_RESET",
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
  });
  await sendPasswordResetEmail(user.email, token);
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const row = await repo.findValidVerificationToken(hashToken(rawToken), "PASSWORD_RESET");
  if (!row) throw AppError.badRequest("Invalid or expired reset token");
  await repo.updatePasswordHash(row.userId, await hashPassword(newPassword));
  await repo.consumeVerificationToken(row.id);
  await repo.revokeAllUserRefreshTokens(row.userId); // force re-login everywhere
}

// ── Google OAuth ────────────────────────────────────────────────────────────
export function getGoogleAuthUrl(state: string): string {
  if (!config.google.enabled) throw AppError.serviceUnavailable("Google OAuth is not configured");
  const params = new URLSearchParams({
    client_id: config.google.clientId!,
    redirect_uri: config.google.callbackUrl!,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

interface GoogleProfile {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

async function fetchGoogleProfile(code: string): Promise<GoogleProfile> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.google.clientId!,
      client_secret: config.google.clientSecret!,
      redirect_uri: config.google.callbackUrl!,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) throw AppError.unauthorized("Google token exchange failed");
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!profileRes.ok) throw AppError.unauthorized("Failed to fetch Google profile");
  return (await profileRes.json()) as GoogleProfile;
}

export async function handleGoogleCallback(code: string, meta: RequestMeta): Promise<AuthResult> {
  if (!config.google.enabled) throw AppError.serviceUnavailable("Google OAuth is not configured");
  const profile = await fetchGoogleProfile(code);

  const linked = await repo.findOAuthAccount("google", profile.sub);
  if (linked) {
    const ctx = await repo.findAuthContext(linked.user.id);
    const role = ctx?.role ?? ROLES.CUSTOMER;
    const { pair } = await createTokenPair(
      { sub: linked.user.id, email: linked.user.email, role },
      meta
    );
    return { user: toPublicUser(linked.user, role), tokens: pair };
  }

  let user = await repo.findUserByEmail(profile.email);
  if (!user) {
    const customerRole = await repo.findRoleByName(ROLES.CUSTOMER);
    if (!customerRole) throw AppError.internal("CUSTOMER role missing — run the seed");
    user = await repo.createUser({
      email: profile.email,
      name: profile.name ?? null,
      image: profile.picture ?? null,
      emailVerified: new Date(),
      referralCode: makeReferralCode(),
      role: { connect: { id: customerRole.id } },
    });
  }
  await repo.linkOAuthAccount({
    userId: user.id,
    provider: "google",
    providerAccountId: profile.sub,
  });

  const ctx = await repo.findAuthContext(user.id);
  const role = ctx?.role ?? ROLES.CUSTOMER;
  const { pair } = await createTokenPair({ sub: user.id, email: user.email, role }, meta);
  await recordAudit({ userId: user.id, action: "auth.google", ...meta });
  return { user: toPublicUser(user, role), tokens: pair };
}
