import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { health, live, ready } from "@/modules/health/health.controller";

export const healthRouter = Router();

healthRouter.get("/", health);
healthRouter.get("/live", live);
healthRouter.get("/ready", asyncHandler(ready));
