import { Badge } from '../../../components/ui/Badge';
import type { ClientHistoryEntry } from '../types';

interface HistoryTabProps {
  history: ClientHistoryEntry[];
}

const ACTION_CONFIG: Record<string, { label: string; variant: 'blue' | 'purple' | 'green' | 'default'; icon: string }> = {
  created: { label: 'Created', variant: 'green', icon: 'plus' },
  updated: { label: 'Updated', variant: 'blue', icon: 'edit' },
  status_changed: { label: 'Status', variant: 'purple', icon: 'toggle' },
  contact_added: { label: 'Contact', variant: 'blue', icon: 'user' },
  service_modified: { label: 'Service', variant: 'default', icon: 'cog' },
  rate_changed: { label: 'Rates', variant: 'green', icon: 'dollar' },
  note_added: { label: 'Note', variant: 'default', icon: 'note' },
};

function getIcon(action: string) {
  switch (action) {
    case 'created':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case 'updated':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    case 'status_changed':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
          <circle cx="16" cy="12" r="3" />
        </svg>
      );
    case 'contact_added':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      );
    case 'service_modified':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'rate_changed':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case 'note_added':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

export function HistoryTab({ history }: HistoryTabProps) {
  // Sort by timestamp descending (newest first)
  const sortedHistory = [...history].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Activity History</h3>
        <p className="text-sm text-text-secondary mt-1">
          A record of all changes and updates for this client
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

        {/* History Items */}
        <div className="space-y-0">
          {sortedHistory.map((entry, index) => {
            const config = ACTION_CONFIG[entry.action] || { label: 'Event', variant: 'default' as const, icon: 'circle' };

            return (
              <div key={entry.id} className="relative flex items-start gap-4 pb-6">
                {/* Timeline Dot */}
                <div className={`relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center bg-white ${
                  index === 0 ? 'border-brand-cyan' : 'border-border'
                }`}>
                  <span className={index === 0 ? 'text-brand-cyan' : 'text-text-muted'}>
                    {getIcon(entry.action)}
                  </span>
                </div>

                {/* Content */}
                <div className={`flex-1 bg-white border rounded-lg p-4 ${
                  index === 0 ? 'border-brand-cyan/30 shadow-sm' : 'border-border'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={config.variant}>{config.label}</Badge>
                        <span className="text-sm text-text-primary font-medium">{entry.description}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span>{formatDate(entry.timestamp)}</span>
                        {entry.userName && (
                          <>
                            <span>•</span>
                            <span>by {entry.userName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <span className="text-xs text-text-muted">
                      {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {sortedHistory.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          <svg className="w-12 h-12 mx-auto mb-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p className="text-lg font-medium">No activity yet</p>
          <p className="text-sm mt-1">Changes to this client will appear here</p>
        </div>
      )}

      {/* Load More */}
      {sortedHistory.length > 10 && (
        <div className="text-center pt-4 border-t border-border">
          <button className="text-sm text-brand-cyan hover:underline">
            Load more activity
          </button>
        </div>
      )}
    </div>
  );
}
