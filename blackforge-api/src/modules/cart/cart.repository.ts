import type { Prisma } from "@prisma/client";
import { prisma } from "@/prisma/client";

export const cartInclude = {
  items: {
    orderBy: { id: "asc" },
    include: {
      product: { include: { images: { take: 1, orderBy: { position: "asc" } } } },
      variant: true,
    },
  },
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

export function findByUserId(userId: string) {
  return prisma.cart.findUnique({ where: { userId }, include: cartInclude });
}

export function findByGuestId(guestId: string) {
  return prisma.cart.findUnique({ where: { guestId }, include: cartInclude });
}

export function findById(id: string) {
  return prisma.cart.findUnique({ where: { id }, include: cartInclude });
}

export function createForUser(userId: string) {
  return prisma.cart.create({ data: { userId }, include: cartInclude });
}

export function createForGuest(guestId: string) {
  return prisma.cart.create({ data: { guestId }, include: cartInclude });
}

export function findItem(cartId: string, productId: string, variantId: string | null) {
  return prisma.cartItem.findFirst({ where: { cartId, productId, variantId } });
}

export function getItem(id: string, cartId: string) {
  return prisma.cartItem.findFirst({ where: { id, cartId } });
}

export function createItem(data: {
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
}) {
  return prisma.cartItem.create({ data });
}

export function setItemQuantity(id: string, quantity: number) {
  return prisma.cartItem.update({ where: { id }, data: { quantity } });
}

export function incrementItem(id: string, by: number) {
  return prisma.cartItem.update({ where: { id }, data: { quantity: { increment: by } } });
}

export function deleteItem(id: string) {
  return prisma.cartItem.delete({ where: { id } });
}

export function deleteCart(id: string) {
  return prisma.cart.delete({ where: { id } });
}
