import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const products = await searchProducts(q, 6);
  return NextResponse.json(
    products.map((p) => ({
      slug: p.slug,
      title: p.title,
      platform: p.platform,
      priceCents: p.priceCents,
    }))
  );
}
