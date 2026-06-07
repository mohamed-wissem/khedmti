import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import type { PaginationQuery } from "@/validators/common";
import * as service from "@/modules/coupons/coupons.service";

export async function validateCoupon(req: Request, res: Response): Promise<void> {
  const result = await service.validatePreview(req.body.code, req.body.subtotalCents, req.user?.id);
  sendSuccess(res, result);
}

export async function list(req: Request, res: Response): Promise<void> {
  const { page, limit } = req.validated?.query as PaginationQuery;
  const { items, meta } = await service.list(page, limit);
  sendSuccess(res, { coupons: items }, 200, meta);
}

export async function create(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { coupon: await service.create(req.body) }, 201);
}

export async function update(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { coupon: await service.update(req.params.id as string, req.body) });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await service.remove(req.params.id as string);
  sendSuccess(res, { message: "Coupon deleted" });
}
