import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import * as service from "@/modules/search/search.service";
import type { SearchQuery } from "@/modules/search/search.validators";

export async function search(req: Request, res: Response): Promise<void> {
  const { q, page, limit } = req.validated?.query as SearchQuery;
  const { items, meta } = await service.fullText(q, page, limit);
  sendSuccess(res, { results: items }, 200, meta);
}

export async function suggest(req: Request, res: Response): Promise<void> {
  const { q } = req.validated?.query as { q: string };
  sendSuccess(res, { suggestions: await service.suggest(q) });
}
