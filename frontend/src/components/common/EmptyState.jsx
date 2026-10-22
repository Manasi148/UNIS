import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = Inbox,
  title = "No records found",
  description = "There are currently no items matching your criteria.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-transparent rounded-card my-4">
      <div className="w-12 h-12 rounded-2xl bg-unis-highlight dark:bg-unis-dark-highlight flex items-center justify-center text-unis-forest dark:text-unis-dark-forest mb-3">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h4 className="text-sm font-semibold text-unis-ink dark:text-unis-dark-text">
        {title}
      </h4>
      <p className="text-xs text-unis-slate dark:text-unis-dark-muted max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
