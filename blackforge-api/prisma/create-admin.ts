/**
 * Create (or promote) a BLACKFORGE admin user — standalone, without running the
 * full seed. Idempotently ensures the ADMIN role + permissions exist, then
 * upserts the user with the ADMIN role.
 *
 * Usage:
 *   npm run create:admin -- you@example.com 'your-password'
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret npm run create:admin
 *   npm run create:admin          # prompts interactively
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ROLES, ALL_PERMISSIONS } from "../src/modules/rbac/permissions";

const prisma = new PrismaClient();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function makeReferralCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join("");
}

async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

async function resolveCredentials(): Promise<{ email: string; password: string }> {
  let email = process.argv[2] ?? process.env.ADMIN_EMAIL ?? "";
  let password = process.argv[3] ?? process.env.ADMIN_PASSWORD ?? "";

  if (!email) {
    if (!process.stdin.isTTY)
      throw new Error("Email required (pass as an argument or ADMIN_EMAIL)");
    email = await prompt("Admin email: ");
  }
  if (!password) {
    if (!process.stdin.isTTY)
      throw new Error("Password required (pass as an argument or ADMIN_PASSWORD)");
    password = await prompt("Admin password (min 8 chars): ");
  }

  email = email.toLowerCase().trim();
  if (!EMAIL_RE.test(email)) throw new Error(`Invalid email: ${email}`);
  if (password.length < 8) throw new Error("Password must be at least 8 characters");
  return { email, password };
}

/** Ensure the ADMIN role exists with every permission linked. */
async function ensureAdminRole(): Promise<string> {
  for (const key of ALL_PERMISSIONS) {
    await prisma.permission.upsert({ where: { key }, update: {}, create: { key } });
  }
  const role = await prisma.role.upsert({
    where: { name: ROLES.ADMIN },
    update: {},
    create: { name: ROLES.ADMIN, description: "ADMIN role" },
  });
  const perms = await prisma.permission.findMany({ where: { key: { in: [...ALL_PERMISSIONS] } } });
  await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
  await prisma.rolePermission.createMany({
    data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
    skipDuplicates: true,
  });
  return role.id;
}

async function main(): Promise<void> {
  const { email, password } = await resolveCredentials();
  const roleId = await ensureAdminRole();
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });
  const user = await prisma.user.upsert({
    where: { email },
    update: { roleId, passwordHash, emailVerified: new Date() },
    create: {
      email,
      name: "Administrator",
      passwordHash,
      emailVerified: new Date(),
      roleId,
      referralCode: `${makeReferralCode()}${randomBytes(1).toString("hex").toUpperCase()}`,
    },
  });

  console.log(
    `✅ ${existing ? "Promoted existing user to" : "Created"} ADMIN: ${user.email} (id: ${user.id})`
  );
}

main()
  .catch((err) => {
    console.error(`❌ ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
