"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/app/dashboard/settings/actions";

export function SettingsForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, {});

  return (
    <form action={action} className="max-w-md space-y-5">
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-smoke">Display name</span>
        <input
          name="name"
          defaultValue={name}
          required
          className="w-full rounded-bf border border-ash bg-iron px-4 py-3 text-moon outline-none focus:border-ember"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-smoke">Email</span>
        <input
          value={email}
          disabled
          className="w-full cursor-not-allowed rounded-bf border border-ash bg-iron/40 px-4 py-3 text-smoke"
        />
        <span className="mt-1 block text-xs text-smoke">Email changes aren&apos;t supported yet.</span>
      </label>

      {state.error && <p className="text-sm text-blood">{state.error}</p>}
      {state.ok && <p className="text-sm text-ember">Saved.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
