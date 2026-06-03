"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyKey({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-bf border border-ash bg-void px-3 py-2">
      <code className="truncate font-mono text-sm text-ember">{value}</code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy key"
        className="shrink-0 text-smoke transition-colors hover:text-moon"
      >
        {copied ? <Check className="h-4 w-4 text-ember" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
