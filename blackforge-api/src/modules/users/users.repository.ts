import type { Prisma, AddressType } from "@prisma/client";
import { prisma } from "@/prisma/client";

export function getUserWithRole(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { role: { select: { name: true } } },
  });
}

export function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export function updateUser(userId: string, data: Prisma.UserUpdateInput) {
  return prisma.user.update({
    where: { id: userId },
    data,
    include: { role: { select: { name: true } } },
  });
}

// ── Addresses ───────────────────────────────────────────────────────────────
export function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export function getAddress(id: string, userId: string) {
  return prisma.address.findFirst({ where: { id, userId } });
}

export function createAddress(data: Prisma.AddressCreateInput) {
  return prisma.address.create({ data });
}

export function updateAddress(id: string, data: Prisma.AddressUpdateInput) {
  return prisma.address.update({ where: { id }, data });
}

export function deleteAddress(id: string) {
  return prisma.address.delete({ where: { id } });
}

/** Clear the default flag on a user's other addresses of the same type. */
export function clearDefaults(userId: string, type: AddressType, exceptId?: string) {
  return prisma.address.updateMany({
    where: { userId, type, isDefault: true, ...(exceptId ? { id: { not: exceptId } } : {}) },
    data: { isDefault: false },
  });
}
