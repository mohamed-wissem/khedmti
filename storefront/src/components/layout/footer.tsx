import Link from "next/link";
import { Swords } from "lucide-react";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Games", href: "/category/games" },
      { label: "Accounts", href: "/category/accounts" },
      { label: "Gift Cards", href: "/category/gift-cards" },
      { label: "Currency", href: "/category/currency" },
      { label: "Subscriptions", href: "/category/subscriptions" },
      { label: "Gear", href: "/category/accessories" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Support Center", href: "/support" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Orders", href: "/dashboard/orders" },
      { label: "Wishlist", href: "/dashboard/wishlist" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/legal/terms" },
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Refunds", href: "/legal/refund" },
    ],
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
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-smoke transition-colors hover:text-moon">
                    {l.label}
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
