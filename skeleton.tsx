import * as React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`animate-pulse rounded-[var(--radius)] bg-muted ${className}`}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";
