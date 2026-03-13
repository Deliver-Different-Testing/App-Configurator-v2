import type { ReactNode } from 'react';

export type BadgeVariant = 'default' | 'blue' | 'purple' | 'green' | 'cyan' | 'system' | 'customized' | 'orange' | 'yellow' | 'red';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-border text-text-secondary',
  blue: 'bg-badge-blue-bg text-badge-blue-text',
  purple: 'bg-badge-purple-bg text-badge-purple-text',
  green: 'bg-badge-green-bg text-badge-green-text',
  cyan: 'bg-brand-cyan text-brand-dark',
  system: 'bg-border text-text-secondary',
  customized: 'bg-badge-purple-bg text-badge-purple-text',
  orange: 'bg-badge-orange-bg text-warning',
  yellow: 'bg-badge-yellow-bg text-warning',
  red: 'bg-error/10 text-error',
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
};

export function Badge({ variant = 'default', children, className = '', size = 'md' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
