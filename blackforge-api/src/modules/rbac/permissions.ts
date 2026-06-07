/**
 * RBAC catalog — the single source of truth for roles and permissions. The seed
 * script materializes these into the `role`, `permission` and `role_permission`
 * tables. Middleware checks permission keys via `requirePermission(...)`.
 */

export const ROLES = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  CUSTOMER: "CUSTOMER",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  // Catalog
  PRODUCT_WRITE: "product:write",
  CATEGORY_WRITE: "category:write",
  BRAND_WRITE: "brand:write",
  // Commerce
  COUPON_WRITE: "coupon:write",
  ORDER_READ_ALL: "order:read:all",
  ORDER_UPDATE: "order:update",
  ORDER_REFUND: "order:refund",
  // Community
  REVIEW_MODERATE: "review:moderate",
  // Administration
  USER_MANAGE: "user:manage",
  ANALYTICS_READ: "analytics:read",
  AUDIT_READ: "audit:read",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionKey[] = Object.values(PERMISSIONS);

/** Permissions granted to STAFF (everything operational except dangerous admin). */
const STAFF_PERMISSIONS: PermissionKey[] = [
  PERMISSIONS.PRODUCT_WRITE,
  PERMISSIONS.CATEGORY_WRITE,
  PERMISSIONS.BRAND_WRITE,
  PERMISSIONS.COUPON_WRITE,
  PERMISSIONS.ORDER_READ_ALL,
  PERMISSIONS.ORDER_UPDATE,
  PERMISSIONS.REVIEW_MODERATE,
  PERMISSIONS.ANALYTICS_READ,
];

/** role name → permission keys. ADMIN gets everything. CUSTOMER gets none. */
export const ROLE_PERMISSIONS: Record<RoleName, PermissionKey[]> = {
  [ROLES.ADMIN]: ALL_PERMISSIONS,
  [ROLES.STAFF]: STAFF_PERMISSIONS,
  [ROLES.CUSTOMER]: [],
};
