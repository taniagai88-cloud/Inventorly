"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox@1.1.4";
import { CheckIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border bg-white dark:bg-input/30 border-gray-300 dark:border-gray-600",
        "data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-accent-foreground",
        "dark:data-[state=checked]:bg-accent dark:data-[state=checked]:border-accent",
        "hover:border-gray-400 dark:hover:border-gray-500",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-background",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "h-5 w-5 shrink-0 rounded-md transition-colors duration-200 outline-none cursor-pointer",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
