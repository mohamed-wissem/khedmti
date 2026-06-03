"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Users } from "lucide-react";

export function ReferralCard({ code, referrals }: { code: string; referrals: number }) {
  const [link, setLink] = useState(`/register?ref=${code}`);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLink(`${window.location.origin}/register?ref=${code}`);
  }, [code]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="forged-surface rounded-bf border border-ash/60 p-5">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-ember" />
        <h2 className="font-display font-semibold tracking-wide text-moon">Refer a friend</h2>
      </div>
      <p className="mt-1 text-sm text-smoke">
        They get started, you earn <span className="text-ember">$5 Forge Credit + 100 XP</span> on their first order.
        {referrals > 0 && <> You&apos;ve referred <span className="text-moon">{referrals}</span> so far.</>}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-bf border border-ash bg-void px-3 py-2">
        <code className="truncate font-mono text-sm text-moon">{link}</code>
        <button type="button" onClick={copy} aria-label="Copy referral link" className="shrink-0 text-smoke hover:text-moon">
          {copied ? <Check className="h-4 w-4 text-ember" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
