export interface PageInput {
  page?: number;
  limit?: number;
}

export interface PageQuery {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Normalize page/limit query params into Prisma skip/take. */
export function getPageQuery(input: PageInput = {}): PageQuery {
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.min(100, Math.max(1, input.limit ?? 20));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

/** Build pagination metadata for a response envelope. */
export function pageMeta(total: number, page: number, limit: number): PageMeta {
  return { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
