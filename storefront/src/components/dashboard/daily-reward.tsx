"use client";

import { useState, useTransition } from "react";
import { Flame, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { claimDaily } from "@/app/dashboard/actions";

export function DailyReward({ claimable, streak }: { claimable: boolean; streak: number }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(!claimable);
  const [msg, setMsg] = useState<string | null>(null);
  const [shownStreak, setShownStreak] = useState(streak);

  const onClaim = () =>
    start(async () => {
      const res = await claimDaily();
      if (res.claimed) {
        setDone(true);
        setShownStreak(res.streak);
        setMsg(`+${res.reward} XP · ${res.streak}-day streak 🔥`);
      } else {
        setDone(true);
        setMsg("Already claimed today — come back tomorrow.");
      }
    });

  return (
    <div className="forged-surface flex items-center gap-4 rounded-bf border border-ash/60 p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-bf border border-ember/40 bg-ember/5">
        <Gift className="h-6 w-6 text-ember" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold tracking-wide text-moon">Daily reward</p>
        <p className="flex items-center gap-1.5 text-sm text-smoke">
          <Flame className="h-3.5 w-3.5 text-ember" />
          {shownStreak}-day streak
          {msg && <span className="ml-1 text-ember">· {msg}</span>}
        </p>
      </div>
      {done ? (
        <span className="shrink-0 rounded-bf border border-ash bg-iron px-3 py-2 text-xs text-smoke">Claimed</span>
      ) : (
        <Button size="sm" onClick={onClaim} disabled={pending}>
          {pending ? "Claiming…" : "Claim"}
        </Button>
      )}
    </div>
  );
}
