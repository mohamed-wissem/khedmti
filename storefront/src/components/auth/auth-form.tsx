"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthFormState } from "@/app/login/actions";

type Action = (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;

export function AuthForm({
  mode,
  action,
  refCode,
}: {
  mode: "login" | "register";
  action: Action;
  refCode?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isRegister = mode === "register";

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-20">
      <div className="forged-surface rounded-bf border border-ash/60 p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Swords className="h-8 w-8 text-ember" strokeWidth={1.5} />
          <h1 className="mt-3 font-display text-2xl font-bold tracking-wide text-moon">
            {isRegister ? "Join the Forge" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-smoke">
            {isRegister ? "Create an account to save XP and track orders." : "Sign in to your loadout."}
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {isRegister && refCode && <input type="hidden" name="ref" value={refCode} />}
          {isRegister && refCode && (
            <p className="rounded-bf border border-bronze/30 bg-bronze/5 px-3 py-2 text-xs text-bronze">
              Referral applied — your friend earns credit on your first order.
            </p>
          )}
          {isRegister && (
            <Field label="Name" name="name" type="text" placeholder="Guts" autoComplete="name" />
          )}
          <Field label="Email" name="email" type="email" placeholder="you@email.com" autoComplete="email" />
          <Field
            label="Password"
            name="password"
            type="password"
            placeholder={isRegister ? "At least 8 characters" : "••••••••"}
            autoComplete={isRegister ? "new-password" : "current-password"}
          />

          {state.error && <p className="text-sm text-blood">{state.error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-smoke">
          {isRegister ? (
            <>Already have an account?{" "}
              <Link href="/login" className="text-ember hover:underline">Log in</Link>
            </>
          ) : (
            <>New here?{" "}
              <Link href="/register" className="text-ember hover:underline">Create an account</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-smoke">{label}</span>
      <input
        required
        {...props}
        className="w-full rounded-bf border border-ash bg-iron px-4 py-3 text-moon outline-none placeholder:text-smoke focus:border-ember"
      />
    </label>
  );
}
