import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) {
  const base = "inline-flex items-center justify-center font-medium rounded-button transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none disabled:active:scale-100";

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  const variants = {
    primary: "bg-gradient-to-r from-unis-brand to-unis-indigo hover:opacity-95 text-white shadow-subtle focus:ring-unis-brand dark:from-unis-brand dark:to-unis-indigo dark:text-white",
    secondary: "bg-unis-blue-light hover:bg-unis-blue-light/80 text-unis-brand border border-unis-brand/20 focus:ring-unis-brand dark:bg-unis-dark-highlight dark:text-unis-dark-brand dark:border-unis-dark-border",
    outline: "bg-transparent hover:bg-unis-bg text-unis-ink border border-unis-border focus:ring-unis-brand dark:text-unis-dark-text dark:border-unis-dark-border dark:hover:bg-unis-dark-elevated",
    danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-subtle dark:bg-rose-700 dark:hover:bg-rose-800",
    ghost: "bg-transparent hover:bg-unis-bg text-unis-slate hover:text-unis-ink focus:ring-unis-brand dark:text-unis-dark-muted dark:hover:text-unis-dark-text dark:hover:bg-unis-dark-elevated",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
}
