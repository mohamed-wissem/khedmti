import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductTile } from "@/components/product/product-tile";
import { listProducts } from "@/lib/products";
import { CATEGORY_BY_SLUG, CATEGORY_LABELS } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORY_BY_SLUG[category];
  return { title: cat ? CATEGORY_LABELS[cat] : "Category" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = CATEGORY_BY_SLUG[category];
  if (!cat) notFound();

  const products = await listProducts({ category: cat });
  const label = CATEGORY_LABELS[cat];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-8 border-b border-ash/40 pb-6">
        <p className="text-xs uppercase tracking-widest text-ember">BLACKFORGE</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-wide text-moon">{label}</h1>
        <p className="mt-1 text-smoke">
          {products.length} item{products.length === 1 ? "" : "s"} · delivered instantly.
        </p>
      </header>

      {products.length === 0 ? (
        <p className="text-smoke">Nothing here yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductTile key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
