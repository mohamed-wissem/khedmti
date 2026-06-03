"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart, cartCount } from "@/lib/cart-store";

export function CartButton() {
  const items = useCart((s) => s.items);
  const open = useCart((s) => s.open);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = mounted ? cartCount(items) : 0;

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Cart"
      className="relative rounded-bf border border-ash bg-iron p-2 text-moon transition-colors hover:border-ember/60"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 font-mono text-[10px] font-bold text-void">
          {count}
        </span>
      )}
    </button>
  );
}
