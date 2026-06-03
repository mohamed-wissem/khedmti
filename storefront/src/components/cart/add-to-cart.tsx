"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCart, type CartLine } from "@/lib/cart-store";

export function AddToCart({
  product,
  qty = 1,
  label = "Add to Cart",
  ...buttonProps
}: {
  product: Omit<CartLine, "quantity">;
  qty?: number;
  label?: string;
} & ButtonProps) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  const onClick = () => {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Button onClick={onClick} {...buttonProps}>
      {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      {added ? "Added" : label}
    </Button>
  );
}
