import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-tr from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-[0_8px_30px_rgb(79_70_229/0.35)] hover:shadow-[0_12px_40px_rgb(79_70_229/0.55)]",
        secondary:
          "bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700/80 ring-1 ring-white/10 shadow-sm",
        ghost: "hover:bg-white/5 text-neutral-200",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-9 px-3",
        lg: "h-10 px-4",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
