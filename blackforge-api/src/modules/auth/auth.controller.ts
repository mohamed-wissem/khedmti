import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import { AppError } from "@/utils/apiError";
import { generateOpaqueToken } from "@/utils/token";
import * as authService from "@/modules/auth/auth.service";

function meta(req: Request) {
  return { ip: req.ip, userAgent: req.headers["user-agent"] };
}

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body, meta(req));
  sendSuccess(res, result, 201);
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body, meta(req));
  sendSuccess(res, result);
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const tokens = await authService.refresh(req.body.refreshToken, meta(req));
  sendSuccess(res, { tokens });
}

export async function logout(req: Request, res: Response): Promise<void> {
  await authService.logout(req.body.refreshToken);
  sendSuccess(res, { message: "Logged out" });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  await authService.requestPasswordReset(req.body.email);
  sendSuccess(res, { message: "If that email exists, a reset link has been sent." });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  await authService.resetPassword(req.body.token, req.body.password);
  sendSuccess(res, { message: "Password updated. Please log in." });
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  await authService.verifyEmail(req.body.token);
  sendSuccess(res, { message: "Email verified." });
}

export async function resendVerification(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  await authService.resendVerification(req.user.id);
  sendSuccess(res, { message: "Verification email sent." });
}

export function me(req: Request, res: Response): void {
  if (!req.user) throw AppError.unauthorized();
  sendSuccess(res, { user: req.user });
}

// ── Google OAuth ────────────────────────────────────────────────────────────
export function googleStart(_req: Request, res: Response): void {
  const state = generateOpaqueToken(16);
  res.redirect(authService.getGoogleAuthUrl(state));
}

export async function googleCallback(req: Request, res: Response): Promise<void> {
  const code = String(req.query.code ?? "");
  if (!code) throw AppError.badRequest("Missing authorization code");
  const result = await authService.handleGoogleCallback(code, meta(req));
  sendSuccess(res, result);
}
