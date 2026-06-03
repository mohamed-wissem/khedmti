import Link from "next/link";
import { ArrowRight, Flame, Gamepad2, UserRound, Gift, Coins, Crown, Headphones, Zap, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductTile } from "@/components/product/product-tile";
import { listProducts } from "@/lib/products";

const PORTALS = [
  { label: "Games", href: "/category/games", icon: Gamepad2 },
  { label: "Accounts", href: "/category/accounts", icon: UserRound },
  { label: "Gift Cards", href: "/category/gift-cards", icon: Gift },
  { label: "Currency", href: "/category/currency", icon: Coins },
  { label: "Subscriptions", href: "/category/subscriptions", icon: Crown },
  { label: "Gear", href: "/category/accessories", icon: Headphones },
];

const TRUST = [
  { icon: Zap, label: "Instant Delivery" },
  { icon: ShieldCheck, label: "Buyer Protection" },
  { icon: Star, label: "4.9/5 · 12,480 reviews" },
];

export default async function Home() {
  // Surface real discounted products as "Flash Deals".
  const all = await listProducts({ sort: "newest" });
  const deals = all.filter((p) => p.compareCents).slice(0, 5);
  const featured = deals.length ? deals : all.slice(0, 5);
  return (
    <>
      {/* HERO */}
      <section className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <span className="mb-6 inline-flex items-center gap-2 rounded-bf border border-ash bg-iron/60 px-3 py-1.5 text-xs uppercase tracking-widest text-smoke">
          <Flame className="h-3.5 w-3.5 text-ember" /> The dark-fantasy marketplace
        </span>
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-moon text-balance sm:text-6xl">
          FORGED FOR PLAYERS WHO
          <br />
          <span className="ember-text">REFUSE TO LOSE</span>
        </h1>
        <p className="mt-6 max-w-xl text-balance text-base text-smoke sm:text-lg">
          Games, accounts, gift cards, currency, subscriptions and gear —
          delivered the instant you pay.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="group">
            Shop Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button size="lg" variant="secondary">
            Today&apos;s Deals
          </Button>
        </div>
      </section>

      {/* CATEGORY PORTALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {PORTALS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="forged-surface group flex flex-col items-center gap-3 rounded-bf border border-ash/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-ember/50 hover:shadow-[0_0_24px_-8px_rgba(249,115,22,0.5)]"
            >
              <Icon className="h-7 w-7 text-smoke transition-colors group-hover:text-ember" strokeWidth={1.5} />
              <span className="text-sm font-medium text-moon">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FLASH DEALS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-ember" />
            <h2 className="font-display text-2xl font-bold tracking-wide text-moon">Flash Deals</h2>
            <span className="rounded-bf bg-iron px-2 py-1 font-mono text-xs text-ember">03:42:11</span>
          </div>
          <Link href="/shop" className="text-sm text-smoke transition-colors hover:text-ember">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {featured.map((p) => (
            <ProductTile key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-ash/60 bg-obsidian/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 py-6 sm:px-6">
          {TRUST.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-smoke">
              <Icon className="h-4 w-4 text-ember" />
              {label}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
