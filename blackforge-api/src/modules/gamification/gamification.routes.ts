import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as ctrl from "@/modules/gamification/gamification.controller";

// Mounted under the users router (already authenticated) at /me.
export const gamificationRouter = Router();

gamificationRouter.get("/gamification", asyncHandler(ctrl.profile));
gamificationRouter.post("/daily-claim", asyncHandler(ctrl.claimDaily));
gamificationRouter.get("/referral", asyncHandler(ctrl.referral));
