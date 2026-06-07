import type { Prisma, TokenType, User } from "@prisma/client";
import { prisma } from "@/prisma/client";
import type { AuthUser } from "@/modules/auth/auth.types";

/** Load the auth principal (role + flattened permission keys) for a user id. */
export async function findAuthContext(userId: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: {
        select: {
          name: true,
          permissions: { select: { permission: { select: { key: true } } } },
        },
      },
    },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role.name,
    permissions: user.role.permissions.map((rp) => rp.permission.key),
  };
}

export function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export function findUserByReferralCode(code: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { referralCode: code } });
}

export function findRoleByName(name: string) {
  return prisma.role.findUnique({ where: { name } });
}

export function createUser(data: Prisma.UserCreateInput): Promise<User> {
  return prisma.user.create({ data });
}

export function setEmailVerified(userId: string): Promise<User> {
  return prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
}

export function updatePasswordHash(userId: string, passwordHash: string): Promise<User> {
  return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

// ── Refresh tokens ──────────────────────────────────────────────────────────
export function createRefreshToken(data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  ip?: string;
  userAgent?: string;
}) {
  return prisma.refreshToken.create({ data });
}

export function findRefreshTokenByHash(tokenHash: string) {
  return prisma.refreshToken.findUnique({ where: { tokenHash } });
}

export function revokeRefreshToken(id: string, replacedBy?: string) {
  return prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date(), replacedBy },
  });
}

export function revokeAllUserRefreshTokens(userId: string) {
  return prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

// ── Verification / reset tokens ─────────────────────────────────────────────
export function createVerificationToken(data: {
  userId: string;
  type: TokenType;
  tokenHash: string;
  expiresAt: Date;
}) {
  return prisma.verificationToken.create({ data });
}

export function findValidVerificationToken(tokenHash: string, type: TokenType) {
  return prisma.verificationToken.findFirst({
    where: { tokenHash, type, consumedAt: null, expiresAt: { gt: new Date() } },
  });
}

export function consumeVerificationToken(id: string) {
  return prisma.verificationToken.update({
    where: { id },
    data: { consumedAt: new Date() },
  });
}

// ── OAuth ───────────────────────────────────────────────────────────────────
export function findOAuthAccount(provider: string, providerAccountId: string) {
  return prisma.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    include: { user: true },
  });
}

export function linkOAuthAccount(data: {
  userId: string;
  provider: string;
  providerAccountId: string;
}) {
  return prisma.oAuthAccount.create({ data });
}
