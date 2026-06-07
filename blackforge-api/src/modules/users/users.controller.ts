import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import { AppError } from "@/utils/apiError";
import * as usersService from "@/modules/users/users.service";

function userId(req: Request): string {
  if (!req.user) throw AppError.unauthorized();
  return req.user.id;
}

export async function getMe(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { user: await usersService.getProfile(userId(req)) });
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { user: await usersService.updateProfile(userId(req), req.body) });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  await usersService.changePassword(userId(req), req.body.currentPassword, req.body.newPassword);
  sendSuccess(res, { message: "Password changed. Other sessions were signed out." });
}

export async function listAddresses(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { addresses: await usersService.listAddresses(userId(req)) });
}

export async function createAddress(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { address: await usersService.createAddress(userId(req), req.body) }, 201);
}

export async function updateAddress(req: Request, res: Response): Promise<void> {
  const address = await usersService.updateAddress(userId(req), req.params.id as string, req.body);
  sendSuccess(res, { address });
}

export async function deleteAddress(req: Request, res: Response): Promise<void> {
  await usersService.deleteAddress(userId(req), req.params.id as string);
  sendSuccess(res, { message: "Address removed" });
}
