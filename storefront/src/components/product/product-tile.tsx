import Link from "next/link";
import { Eye, Zap } from "lucide-react";
import type { Product, Rarity } from "@prisma/client";
import { cn } from "@/lib/utils";
import { formatCents } from "@/lib/format";
import { WishlistButton } from "@/components/product/wishlist-button";

export type ProductCard = Pick<
  Product,
  "id" | "slug" | "title" | "platform" | "priceCents" | "compareCents" | "rarity" | "instant"
>;

const rarityRibbon: Record<Rarity, string> = {
  COMMON: "",
  PREMIUM: "border-bronze/60 text-bronze",
  LEGENDARY: "border-rune/60 text-rune",
};

export function ProductTile({ product, wishlisted = false }: { product: ProductCard; wishlisted?: boolean }) {
  const { slug, title, platform, priceCents, compareCents, rarity, instant } = product;
  const discount = compareCents ? Math.round((1 - priceCents / compareCents) * 100) : 0;

  return (
    <article className="group forged-surface relative flex flex-col overflow-hidden rounded-bf border border-ash/60 transition-all duration-200 hover:-translate-y-1 hover:border-ember/50 hover:shadow-[0_0_28px_-8px_rgba(249,115,22,0.45)]">
      {/* Stretched link for whole-card navigation (kept under interactive buttons) */}
      <Link href={`/product/${slug}`} className="absolute inset-0 z-0" aria-label={title} />

      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-iron to-void">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_20%,rgba(194,65,12,0.18),transparent_70%)]" />

        {rarity !== "COMMON" && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-bf border bg-void/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur",
              rarityRibbon[rarity]
            )}
          >
            {rarity.toLowerCase()}
          </span>
        )}

        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-bf bg-blood px-2 py-0.5 font-mono text-xs font-bold text-moon">
            -{discount}%
          </span>
        )}

        <div className="absolute bottom-3 right-3 z-10 flex gap-2 opacity-0 translate-y-1 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <WishlistButton productId={product.id} initial={wishlisted} />
          <Link href={`/product/${slug}`} aria-label="Quick view" className="rounded-bf border border-ash bg-void/80 p-2 text-moon backdrop-blur transition-colors hover:text-ember">
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-smoke">
          <span>{platform}</span>
          {instant && (
            <span className="ml-auto inline-flex items-center gap-1 text-ember">
              <Zap className="h-3 w-3" /> Instant
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 text-sm font-medium text-moon">{title}</h3>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="font-mono text-base font-bold text-moon">{formatCents(priceCents)}</span>
          {compareCents && (
            <span className="font-mono text-xs text-smoke line-through">{formatCents(compareCents)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
