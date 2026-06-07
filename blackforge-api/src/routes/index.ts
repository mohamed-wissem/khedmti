import { Router } from "express";
import { sendSuccess } from "@/utils/apiResponse";
import { authRouter } from "@/modules/auth/auth.routes";
import { usersRouter } from "@/modules/users/users.routes";
import { productsRouter } from "@/modules/products/products.routes";
import { categoriesRouter } from "@/modules/categories/categories.routes";
import { brandsRouter } from "@/modules/brands/brands.routes";
import { searchRouter } from "@/modules/search/search.routes";

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
apiRouter.use("/products", productsRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/brands", brandsRouter);
apiRouter.use("/search", searchRouter);
