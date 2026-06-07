import { z } from "zod";

const password = z.string().min(8, "Password must be at least 8 characters").max(128);
const email = z.string().email().toLowerCase().trim();

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  email,
  password,
  referralCode: z.string().trim().toUpperCase().optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken is required"),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
