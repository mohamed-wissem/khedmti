import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import { AppError } from "@/utils/apiError";
import * as service from "@/modules/orders/orders.service";
import type { adminListQuery, listOrdersQuery } from "@/modules/orders/orders.validators";
import type { z } from "zod";

function guestId(req: Request): string | undefined {
  const h = req.headers["x-cart-id"];
  return Array.isArray(h) ? h[0] : h;
}

export async function create(req: Request, res: Response): Promise<void> {
  const result = await service.createOrder(
    { userId: req.user?.id, guestId: guestId(req) },
    req.body
  );
  sendSuccess(
    res,
    {
      order: result.order,
      payment: { clientSecret: result.clientSecret, mock: result.mock },
    },
    201
  );
}

export async function list(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const { page, limit } = req.validated?.query as z.infer<typeof listOrdersQuery>;
  const { items, meta } = await service.listForUser(req.user.id, page, limit);
  sendSuccess(res, { orders: items }, 200, meta);
}

export async function listAll(req: Request, res: Response): Promise<void> {
  const { page, limit, status } = req.validated?.query as z.infer<typeof adminListQuery>;
  const { items, meta } = await service.listAll(page, limit, status);
  sendSuccess(res, { orders: items }, 200, meta);
}

export async function get(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { order: await service.getById(req.params.id as string, req.user) });
}

export async function track(req: Request, res: Response): Promise<void> {
  sendSuccess(res, await service.track(req.params.id as string, req.user));
}

export async function cancel(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  sendSuccess(res, { order: await service.cancel(req.params.id as string, req.user) });
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const order = await service.updateStatus(
    req.params.id as string,
    req.body.status,
    req.body.trackingCode,
    req.user.id
  );
  sendSuccess(res, { order });
}
