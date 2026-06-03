import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "./actions";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await auth()) redirect("/dashboard");
  return <AuthForm mode="login" action={loginAction} />;
}
