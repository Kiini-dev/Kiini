import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: string;
  icon?: ReactNode;
  isLoading?: boolean;
  children: ReactNode;
}

export default function Button({ variant = "primary", isLoading = false, icon, children, disabled, className = "", size: _size, ...props }: ButtonProps) {
  const colors = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    outline: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-100",
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${colors[variant]} ${className}`}
    >
      {isLoading ? "Loading..." : <>{icon}{children}</>}
    </button>
  );
}
