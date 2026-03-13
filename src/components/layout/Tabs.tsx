import type { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills';
}

export function Tabs({ tabs, activeTab, onTabChange, variant = 'default' }: TabsProps) {
  if (variant === 'pills') {
    return (
      <div className="flex gap-2 p-2 bg-surface-light rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
              transition-all duration-200
              ${
                activeTab === tab.id
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/50'
              }
            `}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`
                px-1.5 py-0.5 text-xs rounded-full
                ${activeTab === tab.id ? 'bg-brand-cyan/10 text-brand-cyan' : 'bg-gray-100 text-text-muted'}
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1 border-b border-border bg-white">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium
            transition-all duration-200 -mb-px
            ${
              activeTab === tab.id
                ? 'text-brand-cyan'
                : 'text-text-muted hover:text-text-primary hover:bg-gray-50'
            }
          `}
        >
          {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span className={`
              px-2 py-0.5 text-xs rounded-full
              ${activeTab === tab.id ? 'bg-brand-cyan/10 text-brand-cyan' : 'bg-gray-100 text-text-muted'}
            `}>
              {tab.count}
            </span>
          )}
          {/* Active indicator */}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
}
