"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ToggleResult = { needsAuth: true } | { wishlisted: boolean };

export async function toggleWishlist(productId: string): Promise<ToggleResult> {
  const session = await auth();
  if (!session?.user?.id) return { needsAuth: true };
  const userId = session.user.id;

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/dashboard/wishlist");
    return { wishlisted: false };
  }

  await prisma.wishlistItem.create({ data: { userId, productId } });
  revalidatePath("/dashboard/wishlist");
  return { wishlisted: true };
}
