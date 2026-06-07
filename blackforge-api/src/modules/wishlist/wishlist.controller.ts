import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import { AppError } from "@/utils/apiError";
import * as service from "@/modules/wishlist/wishlist.service";

function userId(req: Request): string {
  if (!req.user) throw AppError.unauthorized();
  return req.user.id;
}

export async function list(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { wishlist: await service.list(userId(req)) });
}

export async function add(req: Request, res: Response): Promise<void> {
  sendSuccess(res, await service.add(userId(req), req.params.productId as string), 201);
}

export async function remove(req: Request, res: Response): Promise<void> {
  sendSuccess(res, await service.remove(userId(req), req.params.productId as string));
}
