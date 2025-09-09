import * as React from "react";
import { cn } from "@/lib/cn";

export type TextInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-1 text-sm text-neutral-100 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
TextInput.displayName = "TextInput";
