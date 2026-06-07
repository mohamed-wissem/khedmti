import type { Address, AddressType } from "@prisma/client";
import { AppError } from "@/utils/apiError";
import { hashPassword, verifyPassword } from "@/utils/password";
import { revokeAllUserRefreshTokens } from "@/modules/auth/auth.repository";
import { toPublicUser } from "@/modules/users/user.mapper";
import type { PublicUser } from "@/modules/auth/auth.types";
import * as repo from "@/modules/users/users.repository";

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await repo.getUserWithRole(userId);
  if (!user) throw AppError.notFound("User not found");
  return toPublicUser(user, user.role.name);
}

export async function updateProfile(
  userId: string,
  input: { name?: string; image?: string | null }
): Promise<PublicUser> {
  const data: { name?: string; image?: string | null } = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.image !== undefined) data.image = input.image;
  const user = await repo.updateUser(userId, data);
  return toPublicUser(user, user.role.name);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await repo.getUserById(userId);
  if (!user) throw AppError.notFound("User not found");
  if (!user.passwordHash) {
    throw AppError.badRequest("This account has no password set. Use password reset instead.");
  }
  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) throw AppError.badRequest("Current password is incorrect");

  await repo.updateUser(userId, { passwordHash: await hashPassword(newPassword) });
  await revokeAllUserRefreshTokens(userId); // invalidate other sessions
}

// ── Addresses ───────────────────────────────────────────────────────────────
export function listAddresses(userId: string): Promise<Address[]> {
  return repo.listAddresses(userId);
}

export interface AddressInput {
  type: AddressType;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export async function createAddress(userId: string, input: AddressInput): Promise<Address> {
  const address = await repo.createAddress({ ...input, user: { connect: { id: userId } } });
  if (address.isDefault) await repo.clearDefaults(userId, address.type, address.id);
  return address;
}

export async function updateAddress(
  userId: string,
  id: string,
  input: Partial<AddressInput>
): Promise<Address> {
  const existing = await repo.getAddress(id, userId);
  if (!existing) throw AppError.notFound("Address not found");
  const address = await repo.updateAddress(id, input);
  if (address.isDefault) await repo.clearDefaults(userId, address.type, address.id);
  return address;
}

export async function deleteAddress(userId: string, id: string): Promise<void> {
  const existing = await repo.getAddress(id, userId);
  if (!existing) throw AppError.notFound("Address not found");
  await repo.deleteAddress(id);
}
