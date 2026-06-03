"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/format";
import type { ProductCategory } from "@prisma/client";

const RARITIES = ["COMMON", "PREMIUM", "LEGENDARY"] as const;
const PRICE_BUCKETS = [
  { label: "Under $25", value: "2500" },
  { label: "Under $50", value: "5000" },
  { label: "Under $100", value: "10000" },
];

export function ShopFilters({ platforms }: { platforms: string[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value?: string) => {
      const next = new URLSearchParams(params.toString());
      if (!value || next.get(key) === value) next.delete(key);
      else next.set(key, value);
      router.push(`/shop?${next.toString()}`, { scroll: false });
    },
    [params, router]
  );

  const active = (key: string, value: string) => params.get(key) === value;
  const hasFilters = ["category", "platform", "rarity", "maxPrice"].some((k) => params.get(k));

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border-b border-ash/40 py-5">
      <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-bronze">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );

  const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-bf border px-3 py-1.5 text-xs transition-colors",
        on ? "border-ember bg-ember/10 text-ember" : "border-ash bg-iron text-smoke hover:text-moon"
      )}
    >
      {children}
    </button>
  );

  return (
    <aside className="w-full shrink-0 lg:w-60">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold tracking-wide text-moon">Filters</h2>
        {hasFilters && (
          <button
            type="button"
            onClick={() => router.push("/shop", { scroll: false })}
            className="inline-flex items-center gap-1 text-xs text-smoke hover:text-ember"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <Section title="Category">
        {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((c) => (
          <Chip key={c} on={active("category", c)} onClick={() => setParam("category", c)}>
            {CATEGORY_LABELS[c]}
          </Chip>
        ))}
      </Section>

      {platforms.length > 0 && (
        <Section title="Platform">
          {platforms.map((p) => (
            <Chip key={p} on={active("platform", p)} onClick={() => setParam("platform", p)}>
              {p}
            </Chip>
          ))}
        </Section>
      )}

      <Section title="Rarity">
        {RARITIES.map((r) => (
          <Chip key={r} on={active("rarity", r)} onClick={() => setParam("rarity", r)}>
            {r.charAt(0) + r.slice(1).toLowerCase()}
          </Chip>
        ))}
      </Section>

      <Section title="Price">
        {PRICE_BUCKETS.map((b) => (
          <Chip key={b.value} on={active("maxPrice", b.value)} onClick={() => setParam("maxPrice", b.value)}>
            {b.label}
          </Chip>
        ))}
      </Section>
    </aside>
  );
}

export function SortBar({ count }: { count: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("sort") ?? "popular";

  const onChange = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "popular") next.delete("sort");
    else next.set("sort", value);
    router.push(`/shop?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-5 flex items-center justify-between">
      <p className="text-sm text-smoke">
        <span className="font-mono text-moon">{count}</span> items
      </p>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-bf border border-ash bg-iron px-3 py-2 text-sm text-moon outline-none focus:border-ember"
      >
        <option value="popular">Most popular</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="newest">Newest</option>
      </select>
    </div>
  );
}
