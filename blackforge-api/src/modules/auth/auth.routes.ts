import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate } from "@/middleware/validate";
import { authenticate } from "@/middleware/authenticate";
import { authRateLimiter } from "@/middleware/rateLimit";
import * as ctrl from "@/modules/auth/auth.controller";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@/modules/auth/auth.validators";

export const authRouter = Router();

authRouter.post(
  "/register",
  authRateLimiter,
  validate({ body: registerSchema }),
  asyncHandler(ctrl.register)
);
authRouter.post(
  "/login",
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(ctrl.login)
);
authRouter.post("/refresh", validate({ body: refreshSchema }), asyncHandler(ctrl.refresh));
authRouter.post("/logout", validate({ body: refreshSchema }), asyncHandler(ctrl.logout));

authRouter.post(
  "/forgot-password",
  authRateLimiter,
  validate({ body: forgotPasswordSchema }),
  asyncHandler(ctrl.forgotPassword)
);
authRouter.post(
  "/reset-password",
  authRateLimiter,
  validate({ body: resetPasswordSchema }),
  asyncHandler(ctrl.resetPassword)
);
authRouter.post(
  "/verify-email",
  validate({ body: verifyEmailSchema }),
  asyncHandler(ctrl.verifyEmail)
);
authRouter.post("/resend-verification", authenticate, asyncHandler(ctrl.resendVerification));

authRouter.get("/me", authenticate, ctrl.me);

// Google OAuth
authRouter.get("/google", ctrl.googleStart);
authRouter.get("/google/callback", asyncHandler(ctrl.googleCallback));
