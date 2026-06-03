"use client";

import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCart, type CartLine } from "@/lib/cart-store";

export function BuyNow({
  product,
  ...buttonProps
}: { product: Omit<CartLine, "quantity"> } & ButtonProps) {
  const add = useCart((s) => s.add);
  const close = useCart((s) => s.close);
  const router = useRouter();

  const onClick = () => {
    add(product, 1);
    close();
    router.push("/checkout");
  };

  return (
    <Button variant="secondary" onClick={onClick} {...buttonProps}>
      <Zap className="h-4 w-4" /> Buy Now
    </Button>
  );
}
