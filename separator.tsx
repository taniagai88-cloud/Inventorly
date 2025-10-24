import * as React from "react";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className = "", orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-border ${
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"
        } ${className}`}
        {...props}
      />
    );
  }
);

Separator.displayName = "Separator";
