import type { User } from "@prisma/client";
import type { PublicUser } from "@/modules/auth/auth.types";

/** Map a Prisma User (+ its role name) to the API-safe public shape. */
export function toPublicUser(user: User, roleName: string): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: roleName,
    emailVerified: user.emailVerified !== null,
    xp: user.xp,
    level: user.level,
    creditCents: user.creditCents,
    referralCode: user.referralCode,
    createdAt: user.createdAt,
  };
}
