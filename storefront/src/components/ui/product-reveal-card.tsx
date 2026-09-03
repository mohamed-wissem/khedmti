"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductRevealCardProps {
  name?: string;
  price?: string;
  originalPrice?: string;
  image?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  onAdd?: () => void;
  onFavorite?: () => void;
  enableAnimations?: boolean;
  className?: string;
}

export function ProductRevealCard({
  name = "Premium Wireless Headphones",
  price = "$199",
  originalPrice = "$299",
  image = "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80",
  description = "Experience studio-quality sound with advanced noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
  rating = 4.8,
  reviewCount = 124,
  onAdd,
  onFavorite,
  enableAnimations = true,
  className,
}: ProductRevealCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;

  const handleFavorite = () => {
    setIsFavorite((prev) => !prev);
    onFavorite?.();
  };

  const numericOriginal = Number.parseFloat((originalPrice ?? "0").replace(/[^\d.]/g, ""));
  const numericPrice = Number.parseFloat((price ?? "0").replace(/[^\d.]/g, ""));
  const discountPercent =
    Number.isFinite(numericOriginal) && numericOriginal > 0 && Number.isFinite(numericPrice)
      ? Math.round(((numericOriginal - numericPrice) / numericOriginal) * 100)
      : 0;

  const imageVariants: Variants = {
    rest: { scale: 1 },
    hover: { scale: 1.08 },
  };

  const overlayVariants: Variants = {
    rest: { y: "100%", opacity: 0, filter: "blur(4px)" },
    hover: {
      y: "0%",
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 360,
        damping: 28,
        mass: 0.7,
        staggerChildren: 0.08,
        delayChildren: 0.08,
      },
    },
  };

  const contentVariants: Variants = {
    rest: { opacity: 0, y: 18, scale: 0.96 },
    hover: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 380,
        damping: 24,
        mass: 0.6,
      },
    },
  };

  const favoriteVariants: Variants = {
    rest: { scale: 1, rotate: 0 },
    favorite: {
      scale: [1, 1.25, 1],
      rotate: [0, 10, -10, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  const actionVariants: Variants = {
    rest: { scale: 1, y: 0 },
    hover: shouldAnimate
      ? { scale: 1.03, y: -2, transition: { type: "spring", stiffness: 420, damping: 22 } }
      : {},
    tap: shouldAnimate ? { scale: 0.97 } : {},
  };

  return (
    <motion.div
      data-slot="product-reveal-card"
      initial="rest"
      whileHover={shouldAnimate ? "hover" : undefined}
      variants={{
        rest: { scale: 1, y: 0, filter: "blur(0px)" },
        hover: shouldAnimate
          ? {
              scale: 1.02,
              y: -8,
              filter: "blur(0px)",
              transition: { type: "spring", stiffness: 300, damping: 28, mass: 0.8 },
            }
          : {},
      }}
      className={cn(
        "group relative w-full max-w-[320px] overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground shadow-lg shadow-black/10",
        className
      )}
    >
      <div className="relative overflow-hidden">
        <motion.img
          src={image}
          alt={name}
          variants={imageVariants}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="h-64 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        <motion.button
          type="button"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          variants={favoriteVariants}
          animate={isFavorite ? "favorite" : "rest"}
          onClick={handleFavorite}
          className={cn(
            "absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 backdrop-blur-sm transition-colors",
            isFavorite ? "bg-red-500 text-white" : "bg-white/15 text-white hover:bg-white/25"
          )}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
        </motion.button>

        {discountPercent > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 18 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white"
          >
            {discountPercent}% OFF
          </motion.div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={cn(
                  "h-4 w-4",
                  index < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {rating} ({reviewCount} reviews)
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight text-foreground">{name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">{price}</span>
            {originalPrice && <span className="text-base text-muted-foreground line-through">{originalPrice}</span>}
          </div>
        </div>
      </div>

      <motion.div
        variants={overlayVariants}
        className="absolute inset-0 flex flex-col justify-end bg-background/95 backdrop-blur-xl"
      >
        <div className="space-y-4 p-5">
          <motion.div variants={contentVariants}>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">Product Details</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          </motion.div>

          <motion.div variants={contentVariants} className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-muted/60 p-2 text-center">
              <div className="font-semibold text-foreground">30h Battery</div>
              <div className="text-muted-foreground">Longest life</div>
            </div>
            <div className="rounded-lg bg-muted/60 p-2 text-center">
              <div className="font-semibold text-foreground">Noise Cancel</div>
              <div className="text-muted-foreground">Studio sound</div>
            </div>
          </motion.div>

          <motion.div variants={contentVariants} className="space-y-3">
            <motion.button
              type="button"
              onClick={onAdd}
              variants={actionVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-11 w-full justify-center px-4 font-medium"
              )}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </motion.button>

            <motion.button
              type="button"
              variants={actionVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className={cn(buttonVariants({ variant: "outline" }), "h-10 w-full justify-center px-4 font-medium")}
            >
              View Details
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
