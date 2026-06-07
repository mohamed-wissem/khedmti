import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { authenticate } from "@/middleware/authenticate";
import { validate } from "@/middleware/validate";
import * as ctrl from "@/modules/users/users.controller";
import {
  updateProfileSchema,
  changePasswordSchema,
  addressSchema,
  addressUpdateSchema,
  idParamSchema,
} from "@/modules/users/users.validators";

export const usersRouter = Router();

// All user routes require authentication.
usersRouter.use(authenticate);

usersRouter.get("/me", asyncHandler(ctrl.getMe));
usersRouter.patch("/me", validate({ body: updateProfileSchema }), asyncHandler(ctrl.updateMe));
usersRouter.post(
  "/me/change-password",
  validate({ body: changePasswordSchema }),
  asyncHandler(ctrl.changePassword)
);

usersRouter.get("/me/addresses", asyncHandler(ctrl.listAddresses));
usersRouter.post(
  "/me/addresses",
  validate({ body: addressSchema }),
  asyncHandler(ctrl.createAddress)
);
usersRouter.patch(
  "/me/addresses/:id",
  validate({ params: idParamSchema, body: addressUpdateSchema }),
  asyncHandler(ctrl.updateAddress)
);
usersRouter.delete(
  "/me/addresses/:id",
  validate({ params: idParamSchema }),
  asyncHandler(ctrl.deleteAddress)
);
