import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import { AppError } from "@/utils/apiError";
import * as service from "@/modules/reviews/reviews.service";
import type { listReviewsQuery } from "@/modules/reviews/reviews.validators";
import type { z } from "zod";

type Page = z.infer<typeof listReviewsQuery>;

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  sendSuccess(res, { review: await service.create(req.user.id, req.body) }, 201);
}

export async function listForProduct(req: Request, res: Response): Promise<void> {
  const { page, limit } = req.validated?.query as Page;
  const { items, meta } = await service.listForProduct(req.params.slug as string, page, limit);
  sendSuccess(res, { reviews: items }, 200, meta);
}

export async function update(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  sendSuccess(res, {
    review: await service.update(req.user.id, req.params.id as string, req.body),
  });
}

export async function remove(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  await service.remove(req.params.id as string, req.user);
  sendSuccess(res, { message: "Review removed" });
}

export async function listPending(req: Request, res: Response): Promise<void> {
  const { page, limit } = req.validated?.query as Page;
  const { items, meta } = await service.listPending(page, limit);
  sendSuccess(res, { reviews: items }, 200, meta);
}

export async function moderate(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const review = await service.moderate(req.params.id as string, req.body.status, req.user.id);
  sendSuccess(res, { review });
}
