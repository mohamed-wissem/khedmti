/**
 * Database seed — idempotent. Materializes the RBAC catalog (roles, permissions,
 * and their links) and, if ADMIN_EMAIL/ADMIN_PASSWORD are set, an admin user.
 *
 * Run with: `npm run prisma:seed`.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  ROLES,
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,
  type RoleName,
} from "../src/modules/rbac/permissions";

const prisma = new PrismaClient();

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  "product:write": "Create, update and delete products",
  "category:write": "Manage categories",
  "brand:write": "Manage brands",
  "coupon:write": "Manage coupons",
  "order:read:all": "Read all orders",
  "order:update": "Update order status",
  "order:refund": "Issue refunds",
  "review:moderate": "Approve or reject reviews",
  "user:manage": "Manage users and roles",
  "analytics:read": "View sales/inventory analytics",
  "audit:read": "Read audit logs",
};

async function main(): Promise<void> {
  // 1. Permissions
  for (const key of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      update: { description: PERMISSION_DESCRIPTIONS[key] },
      create: { key, description: PERMISSION_DESCRIPTIONS[key] },
    });
  }

  // 2. Roles + their permission links
  for (const roleName of Object.values(ROLES) as RoleName[]) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `${roleName} role` },
    });

    const keys = ROLE_PERMISSIONS[roleName];
    const perms = await prisma.permission.findMany({ where: { key: { in: keys } } });

    // Reset links to match the catalog exactly.
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    if (perms.length) {
      await prisma.rolePermission.createMany({
        data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
        skipDuplicates: true,
      });
    }
    console.log(`[seed] role ${roleName}: ${perms.length} permissions`);
  }

  // 3. Optional admin user
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: ROLES.ADMIN } });
    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: { roleId: adminRole.id },
      create: {
        email: adminEmail.toLowerCase(),
        name: "Administrator",
        passwordHash: await bcrypt.hash(adminPassword, 12),
        emailVerified: new Date(),
        roleId: adminRole.id,
      },
    });
    console.log(`[seed] admin user ensured: ${adminEmail}`);
  } else {
    console.log("[seed] ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin user");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
