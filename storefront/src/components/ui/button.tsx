import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-bf font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary ember CTA — the only place ember fills
        primary:
          "bg-gradient-to-b from-ember to-ember-deep text-void shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:brightness-110 hover:shadow-[0_0_24px_-4px_rgba(249,115,22,0.55)] hover:tracking-wide",
        secondary:
          "border border-ash bg-iron text-moon hover:border-ember/60 hover:text-moon",
        ghost: "text-smoke hover:bg-iron hover:text-moon",
        bronze:
          "border border-bronze/50 bg-iron text-bronze hover:border-bronze hover:bg-bronze/10",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

export { buttonVariants };
