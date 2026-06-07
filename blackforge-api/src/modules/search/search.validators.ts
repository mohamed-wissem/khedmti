import { z } from "zod";

export const searchQuery = z.object({
  q: z.string().trim().default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const suggestQuery = z.object({
  q: z.string().trim().default(""),
});

export type SearchQuery = z.infer<typeof searchQuery>;
