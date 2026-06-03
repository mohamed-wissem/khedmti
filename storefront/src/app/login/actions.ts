"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { makeReferralCode } from "@/lib/gamification";

export interface AuthFormState {
  error?: string;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  if (!emailRe.test(email) || !password) {
    return { error: "Enter a valid email and password." };
  }
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
    return {};
  } catch (e) {
    if (e instanceof AuthError) return { error: "Invalid email or password." };
    throw e; // re-throw the NEXT_REDIRECT on success
  }
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Tell us your name." };
  if (!emailRe.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists." };

  // Attribute the referrer if a valid referral code came through.
  const refCode = String(formData.get("ref") ?? "").trim().toUpperCase();
  let referredById: string | undefined;
  if (refCode) {
    const referrer = await prisma.user.findUnique({ where: { referralCode: refCode } });
    if (referrer) referredById = referrer.id;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, referralCode: makeReferralCode(), referredById },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
    return {};
  } catch (e) {
    if (e instanceof AuthError) return { error: "Account created — please log in." };
    throw e;
  }
}
