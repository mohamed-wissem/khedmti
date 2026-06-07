import { prisma } from "@/prisma/client";

export function list(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: { include: { images: { take: 1, orderBy: { position: "asc" } } } },
    },
  });
}

export function find(userId: string, productId: string) {
  return prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
}

export function add(userId: string, productId: string) {
  return prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  });
}

export function remove(userId: string, productId: string) {
  return prisma.wishlistItem.deleteMany({ where: { userId, productId } });
}
