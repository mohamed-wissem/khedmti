"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingCart, Zap } from "lucide-react";
import { useCart, cartSubtotalCents, cartCount } from "@/lib/cart-store";
import { formatCents } from "@/lib/format";
import { Button } from "@/components/ui/button";

const FREE_DELIVERY_CENTS = 7500;

export function CartDrawer() {
  const { items, isOpen, close, remove, setQty } = useCart();
  const subtotal = cartSubtotalCents(items);
  const count = cartCount(items);
  const toFree = Math.max(0, FREE_DELIVERY_CENTS - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_CENTS) * 100);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[60] bg-void/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-ash bg-obsidian shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-ash/60 px-5 py-4">
          <h2 className="font-display text-lg font-bold tracking-wide text-moon">
            Your Loadout {count > 0 && <span className="text-smoke">({count})</span>}
          </h2>
          <button type="button" onClick={close} aria-label="Close cart" className="rounded-bf p-2 text-smoke hover:bg-iron hover:text-moon">
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingCart className="h-10 w-10 text-ash" />
            <p className="text-moon">Your loadout is empty.</p>
            <Button variant="secondary" onClick={close}>Browse the armory</Button>
          </div>
        ) : (
          <>
            {/* Free-delivery meter */}
            <div className="border-b border-ash/40 px-5 py-3">
              <p className="text-xs text-smoke">
                {toFree > 0 ? (
                  <>You&apos;re <span className="text-ember">{formatCents(toFree)}</span> from free priority delivery</>
                ) : (
                  <span className="text-ember">Free priority delivery unlocked ⚡</span>
                )}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-iron">
                <div className="h-full rounded-full bg-gradient-to-r from-ember-deep to-ember transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {items.map((i) => (
                  <li key={i.id} className="flex gap-3">
                    <div className="h-16 w-12 shrink-0 rounded-bf bg-gradient-to-br from-iron to-void" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/product/${i.slug}`} onClick={close} className="line-clamp-1 text-sm font-medium text-moon hover:text-ember">
                        {i.title}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] uppercase tracking-wider text-smoke">
                        {i.platform}
                        <Zap className="h-3 w-3 text-ember" />
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-bf border border-ash">
                          <button type="button" aria-label="Decrease" onClick={() => setQty(i.id, i.quantity - 1)} className="px-2 py-1 text-smoke hover:text-moon">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center font-mono text-sm text-moon">{i.quantity}</span>
                          <button type="button" aria-label="Increase" onClick={() => setQty(i.id, i.quantity + 1)} className="px-2 py-1 text-smoke hover:text-moon">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-moon">{formatCents(i.priceCents * i.quantity)}</span>
                          <button type="button" aria-label="Remove" onClick={() => remove(i.id)} className="text-smoke hover:text-blood">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <footer className="border-t border-ash/60 px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-smoke">Subtotal</span>
                <span className="font-mono text-lg font-bold text-moon">{formatCents(subtotal)}</span>
              </div>
              <Link href="/checkout" onClick={close}>
                <Button size="lg" className="w-full">Secure Checkout</Button>
              </Link>
              <p className="mt-2 text-center text-[11px] text-smoke">Instant delivery · Buyer protection · Secure payment</p>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
