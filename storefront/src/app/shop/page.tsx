import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductTile } from "@/components/product/product-tile";
import { ShopFilters, SortBar } from "@/components/product/shop-filters";
import { listProducts, listPlatforms, type ProductSort } from "@/lib/products";
import type { ProductCategory, Rarity } from "@prisma/client";

export const metadata: Metadata = {
  title: "Shop the Armory",
  description: "Browse every game, account, gift card, currency pack, subscription and accessory.",
};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;

  const [products, platforms] = await Promise.all([
    listProducts({
      category: one(sp.category) as ProductCategory | undefined,
      platform: one(sp.platform),
      rarity: one(sp.rarity) as Rarity | undefined,
      maxPriceCents: one(sp.maxPrice) ? Number(one(sp.maxPrice)) : undefined,
      sort: one(sp.sort) as ProductSort | undefined,
    }),
    listPlatforms(),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-wide text-moon">The Armory</h1>
        <p className="mt-1 text-smoke">Gear up. Everything is delivered the instant you pay.</p>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row">
        <Suspense fallback={<div className="w-full lg:w-60" />}>
          <ShopFilters platforms={platforms} />
        </Suspense>

        <div className="min-w-0 flex-1">
          <Suspense fallback={null}>
            <SortBar count={products.length} />
          </Suspense>

          {products.length === 0 ? (
            <div className="forged-surface rounded-bf border border-ash/60 p-12 text-center">
              <p className="text-moon">No items match these filters.</p>
              <p className="mt-1 text-sm text-smoke">Try clearing a filter or two.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductTile key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
