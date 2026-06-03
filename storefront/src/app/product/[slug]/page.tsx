import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Zap, ShieldCheck, RotateCcw, Star, ChevronDown, Flame } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { CATEGORY_LABELS, SLUG_BY_CATEGORY, formatCents } from "@/lib/format";
import { AddToCart } from "@/components/cart/add-to-cart";
import { BuyNow } from "@/components/cart/buy-now";
import { ProductTile } from "@/components/product/product-tile";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.title,
    description: product.description ?? undefined,
  };
}

const TRUST = [
  { icon: Zap, title: "Instant delivery", body: "Your key or account details are delivered to your email and order page the moment payment clears — usually under 60 seconds." },
  { icon: ShieldCheck, title: "Buyer protection", body: "Every order is covered. If something isn't right, our support team makes it right or refunds you." },
  { icon: RotateCcw, title: "Refund policy", body: "Unused, undelivered items are fully refundable. See the Refund Center for digital-goods specifics." },
];

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product.id);
  const discount = product.compareCents
    ? Math.round((1 - product.priceCents / product.compareCents) * 100)
    : 0;
  const categorySlug = SLUG_BY_CATEGORY[product.category];

  const snapshot = {
    id: product.id,
    slug: product.slug,
    title: product.title,
    platform: product.platform,
    priceCents: product.priceCents,
  };

  // Deterministic social-proof number (stable across renders, no hydration drift).
  const boughtThisWeek = 40 + (product.id.split("").reduce((n, c) => n + c.charCodeAt(0), 0) % 160);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    category: CATEGORY_LABELS[product.category],
    url: `${SITE_URL}/product/${product.slug}`,
    offers: {
      "@type": "Offer",
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/product/${product.slug}`,
    },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: 312 },
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <JsonLd data={productJsonLd} />
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-smoke">
        <Link href="/shop" className="hover:text-ember">Shop</Link>
        <span>/</span>
        <Link href={`/category/${categorySlug}`} className="hover:text-ember">{CATEGORY_LABELS[product.category]}</Link>
        <span>/</span>
        <span className="text-moon">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Media */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-bf border border-ash/60 bg-gradient-to-br from-iron to-void">
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_25%,rgba(194,65,12,0.2),transparent_70%)]" />
          {product.rarity !== "COMMON" && (
            <span className="absolute left-4 top-4 rounded-bf border border-bronze/60 bg-void/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-bronze backdrop-blur">
              {product.rarity.toLowerCase()}
            </span>
          )}
        </div>

        {/* Buy box */}
        <div>
          <p className="text-xs uppercase tracking-widest text-smoke">{product.platform}</p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-wide text-moon sm:text-4xl">
            {product.title}
          </h1>

          {/* Rating (static placeholder until reviews land) */}
          <div className="mt-3 flex items-center gap-2 text-sm">
            <div className="flex text-ember">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="text-smoke">4.9 · 312 reviews</span>
          </div>

          {/* Price */}
          <div className="mt-6 flex items-end gap-3">
            <span className="font-mono text-3xl font-bold text-moon">{formatCents(product.priceCents)}</span>
            {product.compareCents && (
              <>
                <span className="font-mono text-lg text-smoke line-through">{formatCents(product.compareCents)}</span>
                <span className="mb-1 rounded-bf bg-blood px-2 py-0.5 font-mono text-xs font-bold text-moon">-{discount}%</span>
              </>
            )}
          </div>

          {product.instant && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-bf border border-ember/30 bg-ember/5 px-3 py-1.5 text-sm text-ember">
              <Zap className="h-4 w-4" /> Instant delivery
            </p>
          )}

          {/* Social proof + scarcity */}
          <p className="mt-3 flex items-center gap-1.5 text-sm text-smoke">
            <Flame className="h-4 w-4 text-ember" />
            <span className="text-moon">{boughtThisWeek}</span> bought this week
            {product.stock > 0 && product.stock <= 10 && (
              <span className="ml-1 text-blood">· only {product.stock} left</span>
            )}
          </p>

          {/* Actions */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <AddToCart product={snapshot} size="lg" className="flex-1" />
            <BuyNow product={snapshot} size="lg" className="flex-1" />
          </div>
          <p className="mt-3 text-xs text-smoke">
            {product.stock > 50 ? "In stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of stock"}
          </p>

          {/* Trust accordion (native details — no JS) */}
          <div className="mt-8 divide-y divide-ash/40 border-y border-ash/40">
            {TRUST.map(({ icon: Icon, title, body }) => (
              <details key={title} className="group py-3">
                <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-medium text-moon">
                  <Icon className="h-4 w-4 text-ember" />
                  {title}
                  <ChevronDown className="ml-auto h-4 w-4 text-smoke transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 pl-7 text-sm text-smoke">{body}</p>
              </details>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold tracking-wide text-moon">Details</h2>
              <p className="mt-2 text-sm leading-relaxed text-smoke">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Cross-sell */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-bold tracking-wide text-moon">Forged with</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((p) => (
              <ProductTile key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
