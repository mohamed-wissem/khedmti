import { z } from "zod";

export const listUsersQuery = z.object({
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]),
});

export const userIdParam = z.object({ id: z.string().min(1) });

export const salesQuery = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

export const inventoryQuery = z.object({
  threshold: z.coerce.number().int().min(0).max(1000).default(5),
});

export const auditQuery = z.object({
  action: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
