import Link from "next/link";
import { Swords, Shield, LogOut, UserRound } from "lucide-react";
import { auth, signOut } from "@/auth";
import { CartButton } from "@/components/cart/cart-button";
import { SearchBox } from "@/components/search/search-box";

const CATEGORIES = [
  { label: "Games", href: "/category/games" },
  { label: "Accounts", href: "/category/accounts" },
  { label: "Gift Cards", href: "/category/gift-cards" },
  { label: "Currency", href: "/category/currency" },
  { label: "Subscriptions", href: "/category/subscriptions" },
  { label: "Gear", href: "/category/accessories" },
];

export async function Topbar() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Account";

  return (
    <header className="sticky top-0 z-50 border-b border-ash/60 bg-void/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Swords className="h-6 w-6 text-ember" strokeWidth={1.5} />
          <span className="font-display text-lg font-bold tracking-widest text-moon">
            BLACK<span className="ember-text">FORGE</span>
          </span>
        </Link>

        {/* Category nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {CATEGORIES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-bf px-3 py-2 text-sm text-smoke transition-colors hover:bg-iron hover:text-moon"
            >
              {c.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <SearchBox />

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden items-center gap-1.5 rounded-bf border border-bronze/40 bg-iron px-2.5 py-1.5 text-xs font-medium text-bronze transition-colors hover:border-bronze sm:flex"
              >
                <Shield className="h-3.5 w-3.5" />
                {firstName}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  aria-label="Sign out"
                  className="rounded-bf border border-ash bg-iron p-2 text-smoke transition-colors hover:text-moon"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden items-center gap-1.5 rounded-bf border border-ash bg-iron px-3 py-1.5 text-sm text-moon transition-colors hover:border-ember/60 sm:flex"
            >
              <UserRound className="h-4 w-4" />
              Log in
            </Link>
          )}
          <CartButton />
        </div>
      </div>
    </header>
  );
}
