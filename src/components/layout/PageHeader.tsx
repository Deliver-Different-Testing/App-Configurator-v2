import type { ReactNode } from 'react';
import { Badge } from '../ui/Badge';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  clientBadge?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, clientBadge, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-text-primary">{title}</h1>
          {clientBadge && (
            <Badge variant="blue">{clientBadge}</Badge>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-base text-text-secondary">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
