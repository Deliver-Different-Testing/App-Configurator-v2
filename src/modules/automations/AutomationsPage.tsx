import { useState, useMemo } from 'react';
import { Plus, Zap, Search, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/filters/SearchInput';
import { FilterDropdown } from '../../components/filters/FilterDropdown';
import { AutomationCard } from './components/AutomationCard';
import type { AutomationRule, AutomationFilterState } from './types';
import { createEmptyAutomation } from './types';
import { smartSearch, type SearchResult } from './utils/smartSearch';
import {
  sampleAutomations,
  sampleCustomers,
  sampleSpeeds,
  sampleJobStatuses,
  sampleTaskTemplates,
  sampleNotificationTemplates,
  sampleSites,
  sampleRegions,
} from './data/sampleData';

export function AutomationsPage() {
  // State
  const [automations, setAutomations] = useState<AutomationRule[]>(sampleAutomations);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newAutomation, setNewAutomation] = useState<AutomationRule | null>(null);

  // AI search state
  const [aiQuery, setAiQuery] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [aiResults, setAiResults] = useState<SearchResult[]>([]);

  // Filter state
  const [filters, setFilters] = useState<AutomationFilterState>({
    customerId: 'all',
    speedId: 'all',
    search: '',
  });

  // Filter automations
  const filteredAutomations = useMemo(() => {
    return automations.filter((auto) => {
      // Customer filter (empty customerIds = all customers)
      if (filters.customerId !== 'all') {
        if (
          !auto.scope.allCustomers &&
          auto.scope.customerIds.length > 0 &&
          !auto.scope.customerIds.includes(filters.customerId)
        ) {
          return false;
        }
      }

      // Speed filter (empty speedIds = all speeds)
      if (filters.speedId !== 'all') {
        if (
          !auto.scope.allSpeeds &&
          auto.scope.speedIds.length > 0 &&
          !auto.scope.speedIds.includes(filters.speedId)
        ) {
          return false;
        }
      }

      // Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesSearch =
          auto.name.toLowerCase().includes(query) ||
          auto.description?.toLowerCase().includes(query);
        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });
  }, [automations, filters]);

  // Handle creating new automation
  const handleNewAutomation = () => {
    const empty = createEmptyAutomation();
    setNewAutomation({
      ...empty,
      id: `auto-new-${Date.now()}`,
      createdAt: '',
      updatedAt: '',
    });
    setIsCreating(true);
    setExpandedId(null);
  };

  // Handle save new automation
  const handleSaveNew = (automation: AutomationRule) => {
    setAutomations((prev) => [automation, ...prev]);
    setIsCreating(false);
    setNewAutomation(null);
  };

  // Handle cancel new automation
  const handleCancelNew = () => {
    setIsCreating(false);
    setNewAutomation(null);
  };

  // Handle update existing automation
  const handleUpdate = (automation: AutomationRule) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === automation.id ? automation : a))
    );
    setExpandedId(null);
  };

  // Handle delete automation
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this automation?')) {
      setAutomations((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // Filter options
  const customerOptions = [
    'All Customers',
    ...sampleCustomers.map((c) => c.shortName),
  ];
  const speedOptions = ['All Speeds', ...sampleSpeeds.map((s) => s.name)];

  // Handle filter changes
  const handleCustomerChange = (values: string[]) => {
    const value = values[0];
    if (!value || value === 'All Customers') {
      setFilters((prev) => ({ ...prev, customerId: 'all' }));
    } else {
      const customer = sampleCustomers.find((c) => c.shortName === value);
      setFilters((prev) => ({ ...prev, customerId: customer?.id || 'all' }));
    }
  };

  const handleSpeedChange = (values: string[]) => {
    const value = values[0];
    if (!value || value === 'All Speeds') {
      setFilters((prev) => ({ ...prev, speedId: 'all' }));
    } else {
      const speed = sampleSpeeds.find((s) => s.name === value);
      setFilters((prev) => ({ ...prev, speedId: speed?.id || 'all' }));
    }
  };

  const clearAllFilters = () => {
    setFilters({
      customerId: 'all',
      speedId: 'all',
      search: '',
    });
  };

  const handleAiSearch = () => {
    if (!aiInput.trim()) {
      setAiQuery('');
      setAiResults([]);
      return;
    }
    setAiQuery(aiInput);
    const results = smartSearch(aiInput, automations, sampleCustomers, sampleSpeeds);
    setAiResults(results);
  };

  const clearAiSearch = () => {
    setAiQuery('');
    setAiInput('');
    setAiResults([]);
  };

  const hasActiveFilters =
    filters.customerId !== 'all' ||
    filters.speedId !== 'all' ||
    filters.search !== '';

  // Get selected filter values for display
  const getSelectedCustomer = (): string[] => {
    if (filters.customerId === 'all') return [];
    const customer = sampleCustomers.find((c) => c.id === filters.customerId);
    return customer ? [customer.shortName] : [];
  };

  const getSelectedSpeed = (): string[] => {
    if (filters.speedId === 'all') return [];
    const speed = sampleSpeeds.find((s) => s.id === filters.speedId);
    return speed ? [speed.name] : [];
  };

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <div className="bg-white border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Automations</h1>
              <p className="text-sm text-text-secondary">
                Create "if this then that" rules to automate workflows
              </p>
            </div>
          </div>
          <Button onClick={handleNewAutomation} disabled={isCreating}>
            <Plus className="w-4 h-4 mr-2" />
            New Automation
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 space-y-4">
        {/* Auto-Mate AI Search */}
        <div className="relative">
          <div className="relative rounded-xl p-[2px]" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6, #06b6d4)' }}>
            <div className="flex items-center bg-white rounded-[10px] overflow-hidden">
              <div className="flex items-center gap-2 pl-4 pr-2 text-brand-cyan">
                <span className="text-lg">⚡</span>
                <span className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Auto-Mate</span>
              </div>
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                placeholder="Ask Auto-Mate: Find medical related automations..."
                className="flex-1 py-3 px-2 text-sm border-0 outline-none bg-transparent placeholder:text-gray-400"
              />
              {aiQuery && (
                <button onClick={clearAiSearch} className="p-2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleAiSearch}
                className="px-4 py-3 bg-brand-cyan text-white hover:bg-brand-cyan/90 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <SearchInput
            value={filters.search}
            onChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
            placeholder="Search automations by name or description..."
          />

          <div className="flex items-center gap-2 flex-wrap">
            <FilterDropdown
              id="customer"
              label="Customer"
              options={customerOptions}
              selectedValues={getSelectedCustomer()}
              onChange={handleCustomerChange}
            />

            <FilterDropdown
              id="speed"
              label="Speed"
              options={speedOptions}
              selectedValues={getSelectedSpeed()}
              onChange={handleSpeedChange}
            />

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-text-muted hover:text-brand-cyan ml-2 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-text-secondary">
          {aiQuery ? (
            <>
              <span className="font-medium text-brand-cyan">⚡ Auto-Mate:</span>{' '}
              {aiResults.length} result{aiResults.length !== 1 ? 's' : ''} for "{aiQuery}"
              <button onClick={clearAiSearch} className="ml-2 text-brand-cyan hover:underline text-xs">
                Clear & show all
              </button>
            </>
          ) : (
            <>Showing {filteredAutomations.length} of {automations.length} automations</>
          )}
        </div>

        {/* New Automation Card */}
        {isCreating && newAutomation && (
          <AutomationCard
            automation={newAutomation}
            customers={sampleCustomers}
            speeds={sampleSpeeds}
            jobStatuses={sampleJobStatuses}
            taskTemplates={sampleTaskTemplates}
            notificationTemplates={sampleNotificationTemplates}
            sites={sampleSites}
            regions={sampleRegions}
            isExpanded={true}
            isNew={true}
            onToggle={() => {}}
            onSave={handleSaveNew}
            onDelete={handleCancelNew}
            onCancel={handleCancelNew}
          />
        )}

        {/* Automations List */}
        <div className="space-y-3">
          {aiQuery ? (
            // AI Search Results
            aiResults.length > 0 ? (
              aiResults.map((result) => (
                <div key={result.automation.id}>
                  <AutomationCard
                    automation={result.automation}
                    customers={sampleCustomers}
                    speeds={sampleSpeeds}
                    jobStatuses={sampleJobStatuses}
                    taskTemplates={sampleTaskTemplates}
                    notificationTemplates={sampleNotificationTemplates}
            sites={sampleSites}
            regions={sampleRegions}
                    isExpanded={expandedId === result.automation.id}
                    onToggle={() =>
                      setExpandedId(expandedId === result.automation.id ? null : result.automation.id)
                    }
                    onSave={handleUpdate}
                    onDelete={() => handleDelete(result.automation.id)}
                  />
                  <div className="flex flex-wrap gap-1 mt-1 ml-4">
                    {result.matchReasons.map((reason, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 text-[11px] rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"
                      >
                        Matched: {reason}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white border-2 border-dashed border-brand-cyan/30 rounded-lg">
                <span className="text-4xl mb-3 block">⚡</span>
                <p className="text-text-muted font-medium">No automations match that query</p>
                <p className="text-sm text-text-muted mt-1">
                  Try searching for keywords like "pickup", "SMS", "status", customer names, or "active"/"inactive"
                </p>
              </div>
            )
          ) : (
            // Regular filtered list
            <>
              {filteredAutomations.map((automation) => (
                <AutomationCard
                  key={automation.id}
                  automation={automation}
                  customers={sampleCustomers}
                  speeds={sampleSpeeds}
                  jobStatuses={sampleJobStatuses}
                  taskTemplates={sampleTaskTemplates}
                  notificationTemplates={sampleNotificationTemplates}
            sites={sampleSites}
            regions={sampleRegions}
                  isExpanded={expandedId === automation.id}
                  onToggle={() =>
                    setExpandedId(expandedId === automation.id ? null : automation.id)
                  }
                  onSave={handleUpdate}
                  onDelete={() => handleDelete(automation.id)}
                />
              ))}

              {filteredAutomations.length === 0 && !isCreating && (
                <div className="text-center py-12 bg-white border-2 border-dashed border-border rounded-lg">
                  <Zap className="w-12 h-12 mx-auto text-text-muted mb-3" />
                  <p className="text-text-muted font-medium">No automations found</p>
                  <p className="text-sm text-text-muted mt-1">
                    {hasActiveFilters
                      ? 'Try adjusting your filters'
                      : 'Click "New Automation" to create your first rule'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
