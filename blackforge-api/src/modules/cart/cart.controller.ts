import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import { AppError } from "@/utils/apiError";
import * as service from "@/modules/cart/cart.service";
import type { CartContext } from "@/modules/cart/cart.service";

/** Build a cart context from the auth principal or the guest cart header. */
function ctx(req: Request): CartContext {
  const guestHeader = req.headers["x-cart-id"];
  const guestId = Array.isArray(guestHeader) ? guestHeader[0] : guestHeader;
  return { userId: req.user?.id, guestId };
}

export async function getCart(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { cart: await service.getCart(ctx(req)) });
}

export async function addItem(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { cart: await service.addItem(ctx(req), req.body) }, 201);
}

export async function updateItem(req: Request, res: Response): Promise<void> {
  const cart = await service.updateItem(ctx(req), req.params.itemId as string, req.body.quantity);
  sendSuccess(res, { cart });
}

export async function removeItem(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { cart: await service.removeItem(ctx(req), req.params.itemId as string) });
}

export async function merge(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  sendSuccess(res, { cart: await service.merge(req.user.id, req.body.guestId) });
}
