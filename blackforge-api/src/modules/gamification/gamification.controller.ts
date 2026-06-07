import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import { AppError } from "@/utils/apiError";
import * as service from "@/modules/gamification/gamification.service";

function userId(req: Request): string {
  if (!req.user) throw AppError.unauthorized();
  return req.user.id;
}

export async function profile(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { gamification: await service.getProfile(userId(req)) });
}

export async function claimDaily(req: Request, res: Response): Promise<void> {
  sendSuccess(res, await service.claimDaily(userId(req)));
}

export async function referral(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { referral: await service.getReferral(userId(req)) });
}
