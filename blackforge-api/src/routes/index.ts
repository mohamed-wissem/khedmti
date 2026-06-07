import { Router } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import { authRouter } from "@/modules/auth/auth.routes";
import { usersRouter } from "@/modules/users/users.routes";

/**
 * API v1 router. Feature module routers are mounted here as sprints land.
 */
export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  sendSuccess(res, {
    name: "BLACKFORGE API",
    version: "v1",
    docs: "/docs",
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
