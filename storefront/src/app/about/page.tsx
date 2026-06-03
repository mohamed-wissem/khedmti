import type { Metadata } from "next";
import Link from "next/link";
import { Swords, Zap, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: "Why BLACKFORGE exists, and the promise behind every order.",
};

const STATS = [
  { value: "1M+", label: "Orders fulfilled" },
  { value: "<60s", label: "Avg. delivery" },
  { value: "4.9/5", label: "Player rating" },
  { value: "24/7", label: "Support" },
];

const VALUES = [
  { icon: Zap, title: "Instant or it's broken", body: "Digital goods should arrive the moment you pay. Anything slower is a bug we fix." },
  { icon: ShieldCheck, title: "Trust is the product", body: "Buyer protection, transparent policies, and verified delivery on every order." },
  { icon: Trophy, title: "Reward the loyal", body: "XP, ranks, Forge Credit, and referrals — your time here pays you back." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
      <header className="text-center">
        <Swords className="mx-auto h-10 w-10 text-ember" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-4xl font-bold tracking-wide text-moon">
          Forged for players who refuse to lose
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-smoke">
          In an age after the kingdoms fell, the great forges went cold — all but one. BLACKFORGE keeps
          its fires lit, arming those who refuse to be ordinary. We don&apos;t sell games. We hand you the
          blade and point you at the dark.
        </p>
      </header>

      <section className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="forged-surface rounded-bf border border-ash/60 p-5 text-center">
            <p className="font-display text-2xl font-bold text-moon">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-smoke">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 space-y-4">
        {VALUES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="forged-surface flex gap-4 rounded-bf border border-ash/60 p-5">
            <Icon className="h-6 w-6 shrink-0 text-ember" strokeWidth={1.5} />
            <div>
              <h2 className="font-display text-lg font-semibold tracking-wide text-moon">{title}</h2>
              <p className="mt-1 text-sm text-smoke">{body}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="mt-12 text-center">
        <Link href="/shop"><Button size="lg">Enter the armory</Button></Link>
      </div>
    </div>
  );
}
