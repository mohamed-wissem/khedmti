import { Router } from "express";
import { sendSuccess } from "@/utils/apiResponse";

/**
 * API v1 router. Feature module routers (auth, products, orders, ...) get mounted
 * here in later sprints, e.g. `apiRouter.use("/auth", authRouter)`.
 */
export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  sendSuccess(res, {
    name: "BLACKFORGE API",
    version: "v1",
    docs: "/docs",
  });
});
