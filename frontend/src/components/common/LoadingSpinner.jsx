import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ text, message = "Loading institutional services..." }) {
  const displayText = text || message;
  return (
    <div className="flex flex-col items-center justify-center min-h-[220px] p-6 text-center">
      <Loader2 className="w-8 h-8 text-unis-forest dark:text-unis-dark-forest animate-spin mb-3" />
      <p className="text-xs font-medium text-unis-slate dark:text-unis-dark-muted tracking-wide">
        {displayText}
      </p>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center space-x-4 py-3 animate-pulse">
      <div className="w-10 h-10 bg-stone-200 dark:bg-stone-800 rounded-xl"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-3/4"></div>
        <div className="h-2 bg-stone-200 dark:bg-stone-800 rounded w-1/2"></div>
      </div>
      <div className="w-16 h-6 bg-stone-200 dark:bg-stone-800 rounded-full"></div>
    </div>
  );
}
