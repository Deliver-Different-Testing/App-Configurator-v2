import type { ReactNode } from 'react';
import { Link2, AlertTriangle } from 'lucide-react';

/**
 * ConnectionBadge - Shows connection count for an entity
 *
 * Replaces the old "3 Tags" button with a connection-focused display.
 * Shows how many categories have connections, with optional warning
 * indicator if some expected connections are missing.
 *
 * See TAG-SYSTEM-SPEC.md section 9.1.
 */

interface ConnectionBadgeProps {
  /** Number of categories that have connections (0-10) */
  connectionCount: number;
  /** Show warning indicator if some expected connections are missing */
  hasIssues?: boolean;
  /** Opens the TagSidebar when clicked */
  onClick: (e?: React.MouseEvent) => void;
  /** Optional size variant */
  size?: 'sm' | 'md';
}

export function ConnectionBadge({
  connectionCount,
  hasIssues = false,
  onClick,
  size = 'md',
}: ConnectionBadgeProps): ReactNode {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-2',
  };

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  // Determine badge color based on connection status
  const getBadgeStyles = () => {
    if (connectionCount === 0) {
      // No connections - could be a problem
      return 'bg-gray-100 text-gray-500 hover:bg-gray-200';
    }
    if (hasIssues) {
      // Some connections but issues exist
      return 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200';
    }
    // Normal connected state
    return 'bg-brand-cyan/10 text-brand-dark hover:bg-brand-cyan/20';
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-lg font-medium transition-colors ${sizeClasses[size]} ${getBadgeStyles()}`}
    >
      {hasIssues ? (
        <AlertTriangle className={`${iconSize} text-amber-500`} />
      ) : (
        <Link2 className={iconSize} />
      )}
      <span>
        {connectionCount} {connectionCount === 1 ? 'Connection' : 'Connections'}
      </span>
    </button>
  );
}
