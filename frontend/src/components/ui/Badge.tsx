import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'verified' | 'featured' | 'pending' | 'rejected' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    featured: 'bg-amber-50 text-amber-700 border-amber-200',
    pending: 'bg-blue-50 text-blue-700 border-blue-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    outline: 'bg-transparent text-slate-600 border-slate-300',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
