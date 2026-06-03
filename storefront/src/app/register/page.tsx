import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { registerAction } from "../login/actions";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  if (await auth()) redirect("/dashboard");
  const { ref } = await searchParams;
  return <AuthForm mode="register" action={registerAction} refCode={ref} />;
}
