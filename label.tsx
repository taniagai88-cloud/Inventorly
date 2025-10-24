import * as React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";
