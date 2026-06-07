import { Prisma } from "@prisma/client";
import { prisma } from "@/prisma/client";
import { getPageQuery, pageMeta } from "@/utils/pagination";

export interface SearchHit {
  id: string;
  slug: string;
  title: string;
  platform: string | null;
  priceCents: number;
  rarity: string;
  avgRating: number;
}

// Reusable tsvector expression (title + description + platform).
const TSVECTOR = Prisma.sql`to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(platform,''))`;

/** Postgres full-text search with ranking + pagination. */
export async function fullText(q: string, page: number, limit: number) {
  const { skip, take } = getPageQuery({ page, limit });
  if (!q.trim()) return { items: [] as SearchHit[], meta: pageMeta(0, page, limit) };

  const tsquery = Prisma.sql`websearch_to_tsquery('english', ${q})`;

  const items = await prisma.$queryRaw<SearchHit[]>`
    SELECT id, slug, title, platform, "priceCents", rarity::text AS rarity, "avgRating"
    FROM bfapi.product
    WHERE active = true AND ${TSVECTOR} @@ ${tsquery}
    ORDER BY ts_rank(${TSVECTOR}, ${tsquery}) DESC, "avgRating" DESC
    LIMIT ${take} OFFSET ${skip}`;

  const countRows = await prisma.$queryRaw<{ count: number }[]>`
    SELECT count(*)::int AS count
    FROM bfapi.product
    WHERE active = true AND ${TSVECTOR} @@ ${tsquery}`;

  const total = Number(countRows[0]?.count ?? 0);
  return { items, meta: pageMeta(total, page, limit) };
}

/** Lightweight typeahead (storefront-compatible shape). */
export function suggest(q: string) {
  if (!q.trim()) return Promise.resolve([]);
  return prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { platform: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 6,
    orderBy: { reviewCount: "desc" },
    select: { slug: true, title: true, platform: true, priceCents: true },
  });
}
