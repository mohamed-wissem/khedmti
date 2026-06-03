import type { Metadata } from "next";
import Link from "next/link";
import { ProductTile } from "@/components/product/product-tile";
import { listProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Search" };

type SP = Record<string, string | string[] | undefined>;

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const results = q ? await listProducts({ search: q }) : [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <p className="text-sm text-smoke">Search results for</p>
        <h1 className="font-display text-3xl font-bold tracking-wide text-moon">&ldquo;{q}&rdquo;</h1>
        <p className="mt-1 text-smoke">{results.length} item{results.length === 1 ? "" : "s"} found</p>
      </header>

      {results.length === 0 ? (
        <div className="forged-surface rounded-bf border border-ash/60 p-12 text-center">
          <p className="text-moon">No matches{q ? ` for "${q}"` : ""}.</p>
          <p className="mt-1 text-sm text-smoke">Try a different term, or browse the full armory.</p>
          <Link href="/shop" className="mt-6 inline-block">
            <Button>Browse all</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => (
            <ProductTile key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
