import React from 'react';

export function Card({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  ...props
}) {
  const hoverClass = hover
    ? "hover:shadow-elevated hover:border-unis-sage/40 dark:hover:border-unis-dark-sage/40 hover:-translate-y-0.5 transition-all duration-200"
    : "";

  return (
    <div
      className={`bg-unis-card dark:bg-unis-dark-card border border-unis-border dark:border-unis-dark-border rounded-card shadow-subtle dark:shadow-dark-subtle ${hoverClass} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-unis-ink dark:text-unis-dark-text tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-unis-slate dark:text-unis-dark-muted mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
