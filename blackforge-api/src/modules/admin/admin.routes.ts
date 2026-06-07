import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate } from "@/middleware/validate";
import { authenticate } from "@/middleware/authenticate";
import { requirePermission } from "@/middleware/authorize";
import { PERMISSIONS } from "@/modules/rbac/permissions";
import * as ctrl from "@/modules/admin/admin.controller";
import {
  listUsersQuery,
  updateRoleSchema,
  userIdParam,
  salesQuery,
  inventoryQuery,
  auditQuery,
} from "@/modules/admin/admin.validators";

export const adminRouter = Router();

// Every admin route requires authentication.
adminRouter.use(authenticate);

// User management
adminRouter.get(
  "/users",
  requirePermission(PERMISSIONS.USER_MANAGE),
  validate({ query: listUsersQuery }),
  asyncHandler(ctrl.listUsers)
);
adminRouter.patch(
  "/users/:id/role",
  requirePermission(PERMISSIONS.USER_MANAGE),
  validate({ params: userIdParam, body: updateRoleSchema }),
  asyncHandler(ctrl.updateUserRole)
);

// Analytics
adminRouter.get(
  "/analytics/sales",
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validate({ query: salesQuery }),
  asyncHandler(ctrl.sales)
);
adminRouter.get(
  "/analytics/inventory",
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validate({ query: inventoryQuery }),
  asyncHandler(ctrl.inventory)
);

// Audit logs
adminRouter.get(
  "/audit-logs",
  requirePermission(PERMISSIONS.AUDIT_READ),
  validate({ query: auditQuery }),
  asyncHandler(ctrl.auditLogs)
);
