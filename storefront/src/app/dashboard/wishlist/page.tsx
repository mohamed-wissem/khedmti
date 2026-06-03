import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProductTile } from "@/components/product/product-tile";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold tracking-wide text-moon">Wishlist</h1>

      {items.length === 0 ? (
        <div className="forged-surface rounded-bf border border-ash/60 p-10 text-center">
          <Heart className="mx-auto h-9 w-9 text-ash" />
          <p className="mt-3 text-moon">Your wishlist is empty.</p>
          <p className="mt-1 text-sm text-smoke">Tap the heart on any item to save it here.</p>
          <Link href="/shop" className="mt-3 inline-block text-sm text-ember hover:underline">Browse the armory →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((w) => (
            <ProductTile key={w.id} product={w.product} wishlisted />
          ))}
        </div>
      )}
    </div>
  );
}
