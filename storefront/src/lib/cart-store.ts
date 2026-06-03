"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  id: string;
  slug: string;
  title: string;
  platform: string | null;
  priceCents: number;
  quantity: number;
}

interface CartState {
  items: CartLine[];
  isOpen: boolean;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (line, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === line.id);
          const items = existing
            ? s.items.map((i) => (i.id === line.id ? { ...i, quantity: i.quantity + qty } : i))
            : [...s.items, { ...line, quantity: qty }];
          return { items, isOpen: true };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: "blackforge-cart" }
  )
);

/** Derived totals (call inside a component with the items array). */
export const cartCount = (items: CartLine[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotalCents = (items: CartLine[]) =>
  items.reduce((n, i) => n + i.priceCents * i.quantity, 0);
