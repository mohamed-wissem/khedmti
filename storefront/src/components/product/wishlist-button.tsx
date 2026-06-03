"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleWishlist } from "@/app/dashboard/wishlist/actions";

export function WishlistButton({
  productId,
  initial = false,
  className,
}: {
  productId: string;
  initial?: boolean;
  className?: string;
}) {
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    start(async () => {
      const res = await toggleWishlist(productId);
      if ("needsAuth" in res) {
        router.push("/login");
        return;
      }
      setOn(res.wishlisted);
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={on}
      className={cn(
        "rounded-bf border border-ash bg-void/80 p-2 backdrop-blur transition-colors hover:text-ember",
        on ? "text-ember" : "text-moon",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", on && "fill-current")} />
    </button>
  );
}
