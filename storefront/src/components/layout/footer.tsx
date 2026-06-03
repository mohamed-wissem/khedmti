import Link from "next/link";
import { Swords } from "lucide-react";

const COLUMNS = [
  {
    title: "Shop",
    links: ["Games", "Accounts", "Gift Cards", "Currency", "Subscriptions", "Gear"],
  },
  {
    title: "Support",
    links: ["Help Center", "Delivery", "Refunds", "Contact", "FAQ"],
  },
  {
    title: "Company",
    links: ["About", "The Codex", "Careers", "Affiliates"],
  },
  {
    title: "Legal",
    links: ["Terms", "Privacy", "Cookies"],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ash/60 bg-obsidian/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 sm:px-6 md:grid-cols-5">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-ember" strokeWidth={1.5} />
            <span className="font-display text-base font-bold tracking-widest">
              BLACKFORGE
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-smoke">
            Forged for players who refuse to lose. Delivered instantly.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-bronze">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm text-smoke transition-colors hover:text-moon">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ash/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-smoke sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} BLACKFORGE. Inspired by dark fantasy. All assets original.</p>
          <p className="font-mono">Secure payments · Instant delivery · Buyer protection</p>
        </div>
      </div>
    </footer>
  );
}
