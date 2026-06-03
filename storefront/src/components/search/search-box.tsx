"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { formatCents } from "@/lib/format";

interface Hit {
  slug: string;
  title: string;
  platform: string | null;
  priceCents: number;
}

export function SearchBox() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced typeahead
  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (res.ok) setHits(await res.json());
      } catch {
        /* aborted */
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative ml-auto hidden flex-1 max-w-xs md:block">
      <form
        onSubmit={submit}
        className="flex items-center gap-2 rounded-bf border border-ash bg-iron px-3 py-2 text-smoke focus-within:border-ember"
      >
        <Search className="h-4 w-4" />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search the armory…"
          className="w-full bg-transparent text-sm text-moon outline-none placeholder:text-smoke"
        />
      </form>

      {open && hits.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-bf border border-ash bg-obsidian shadow-2xl">
          {hits.map((h) => (
            <Link
              key={h.slug}
              href={`/product/${h.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between gap-3 border-b border-ash/40 px-3 py-2.5 text-sm last:border-0 hover:bg-iron"
            >
              <span className="min-w-0">
                <span className="line-clamp-1 text-moon">{h.title}</span>
                <span className="text-xs text-smoke">{h.platform}</span>
              </span>
              <span className="shrink-0 font-mono text-xs text-moon">{formatCents(h.priceCents)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
