import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center transition-colors disabled:opacity-50 disabled:pointer-events-none";
    
    const variantStyles = {
      default: "bg-primary text-primary-foreground hover:opacity-90",
      outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
    };
    
    const sizeStyles = {
      default: "h-10 px-4 py-2 rounded-[var(--radius)]",
      sm: "h-9 px-3 rounded-[var(--radius)]",
      lg: "h-11 px-8 rounded-[var(--radius)]",
      icon: "h-10 w-10 rounded-[var(--radius)]",
    };
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
