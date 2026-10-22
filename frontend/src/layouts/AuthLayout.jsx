import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Full-screen auth shell.
 * Eliminates outer card margins, padding, and duplicate top branding.
 * Allows login and registration pages to occupy the full available viewport.
 */
export function AuthLayout() {
  return (
    <div className="min-h-[100dvh] w-full bg-unis-bg dark:bg-unis-dark-bg text-unis-ink dark:text-unis-dark-text transition-colors duration-200">
      <Outlet />
    </div>
  );
}
