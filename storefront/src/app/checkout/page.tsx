"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, Zap } from "lucide-react";
import { useCart, cartSubtotalCents } from "@/lib/cart-store";
import { formatCents } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { placeOrder } from "./actions";

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const subtotal = cartSubtotalCents(items);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await placeOrder(
        email,
        items.map((i) => ({ id: i.id, quantity: i.quantity }))
      );
      if (res.ok) {
        clear();
        router.push(`/order/${res.orderId}`);
      } else {
        setError(res.error);
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-moon">Your cart is empty</h1>
        <p className="mt-2 text-smoke">Add something to your loadout first.</p>
        <Link href="/shop" className="mt-6 inline-block">
          <Button>Browse the armory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-display text-3xl font-bold tracking-wide text-moon">Checkout</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Demo notice */}
          <div className="rounded-bf border border-bronze/40 bg-bronze/5 px-4 py-3 text-sm text-bronze">
            Demo checkout — no real payment is processed. A real order is created and digital keys are generated instantly.
          </div>

          {/* Contact */}
          <section>
            <h2 className="mb-3 font-display text-lg font-semibold tracking-wide text-moon">Contact</h2>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full rounded-bf border border-ash bg-iron px-4 py-3 text-moon outline-none placeholder:text-smoke focus:border-ember"
            />
            <p className="mt-1.5 text-xs text-smoke">Your keys are delivered here and on the order page.</p>
          </section>

          {/* Payment (mock) */}
          <section>
            <h2 className="mb-3 font-display text-lg font-semibold tracking-wide text-moon">Payment</h2>
            <div className="space-y-3 rounded-bf border border-ash bg-iron/40 p-4">
              <input disabled placeholder="Card number — Stripe Elements goes here" className="w-full rounded-bf border border-ash bg-iron px-4 py-3 text-sm text-smoke" />
              <div className="grid grid-cols-2 gap-3">
                <input disabled placeholder="MM / YY" className="rounded-bf border border-ash bg-iron px-4 py-3 text-sm text-smoke" />
                <input disabled placeholder="CVC" className="rounded-bf border border-ash bg-iron px-4 py-3 text-sm text-smoke" />
              </div>
            </div>
          </section>

          {error && <p className="text-sm text-blood">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            <Lock className="h-4 w-4" />
            {pending ? "Placing order…" : `Pay ${formatCents(subtotal)}`}
          </Button>

          <div className="flex items-center justify-center gap-5 text-xs text-smoke">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-ember" /> Buyer protection</span>
            <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-ember" /> Instant delivery</span>
          </div>
        </form>

        {/* Summary */}
        <aside className="h-fit rounded-bf border border-ash/60 forged-surface p-5">
          <h2 className="mb-4 font-display text-lg font-semibold tracking-wide text-moon">Order summary</h2>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="line-clamp-1 text-moon">{i.title}</span>
                  <span className="text-xs text-smoke">Qty {i.quantity}</span>
                </span>
                <span className="font-mono text-moon">{formatCents(i.priceCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-ash/40 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-moon">Total</span>
              <span className="font-mono text-xl font-bold text-moon">{formatCents(subtotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
