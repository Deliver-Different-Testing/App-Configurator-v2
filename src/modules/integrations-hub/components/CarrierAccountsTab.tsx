import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Toggle } from '../../../components/ui/Toggle';
import { Button } from '../../../components/ui/Button';
import { ConnectionBadge } from '../../../components/tags';
import { carrierAccountsApi } from '../../../api/carrierAccounts';
import { sampleCarrierAccounts } from '../../../api/sampleData';
import { sampleAccountConnections } from '../data/sampleData';
import { CARRIER_LABELS, CARRIER_CODES, createEmptyConnections, countConnectedCategories } from '../types';
import type { CarrierType, EntityConnections, SourceItem } from '../types';

interface CarrierAccountsTabProps {
  carrier: CarrierType;
  onConnectionsClick?: (sourceItem: SourceItem, connections: EntityConnections) => void;
}

export function CarrierAccountsTab({ carrier, onConnectionsClick }: CarrierAccountsTabProps) {
  const queryClient = useQueryClient();
  const carrierCode = CARRIER_CODES[carrier];

  // Fetch accounts from API
  const { data: apiAccounts, isLoading, error } = useQuery({
    queryKey: ['carrierAccounts', carrier],
    queryFn: () => carrierAccountsApi.getAll({ carrierTypeCode: carrierCode }),
  });

  // Use sample data if API fails or returns empty/non-array
  const useSampleData = !!error || (!isLoading && (!Array.isArray(apiAccounts) || apiAccounts.length === 0));
  const accounts = useSampleData
    ? sampleCarrierAccounts.filter(a => a.carrierType === carrierCode)
    : (apiAccounts ?? []);

  // Mutation for updating account status
  const updateMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      carrierAccountsApi.update(id, {
        accountNumber: accounts.find(a => a.id === id)?.accountNumber || '',
        isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrierAccounts', carrier] });
    },
  });

  const primaryAccount = accounts.find(a => a.clientId === null);
  const secondaryAccounts = accounts.filter(a => a.clientId !== null);

  const handleToggleActive = (id: number, currentActive: boolean) => {
    updateMutation.mutate({ id, isActive: !currentActive });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && !useSampleData) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {useSampleData && (
        <div className="text-xs text-amber-600 mb-2">
          Showing sample data - connect to backend for live data
        </div>
      )}
      {/* Primary Account Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
            Primary Account
          </h3>
          <span className="text-xs text-text-muted">Tenant Default</span>
        </div>

        {primaryAccount ? (
          <div
            className={`p-5 rounded-xl border-2 transition-all ${
              primaryAccount.isActive
                ? 'bg-white border-brand-cyan/30 shadow-sm'
                : 'bg-gray-50 border-border opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-brand-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">
                      {primaryAccount.accountName || `${CARRIER_LABELS[carrier]} Primary Account`}
                    </h4>
                    <p className="text-sm text-text-muted">
                      Used when no client-specific account is configured
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-text-muted block text-xs mb-0.5">Account Number</span>
                    <span className="text-text-primary font-mono">{primaryAccount.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-xs mb-0.5">Meter Number</span>
                    <span className="text-text-primary">{primaryAccount.meterNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-xs mb-0.5">Last Updated</span>
                    <span className="text-text-primary">{formatDate(primaryAccount.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Connection Badge */}
                {onConnectionsClick && (() => {
                  const accountId = String(primaryAccount.id);
                  const connData = sampleAccountConnections[accountId];
                  const connections = connData?.connections || createEmptyConnections();
                  const connectedCount = connData?.connectedCount || countConnectedCategories(connections);
                  return (
                    <ConnectionBadge
                      connectionCount={connectedCount}
                      hasIssues={connData?.hasIssues || false}
                      onClick={() => onConnectionsClick(
                        { type: 'service', id: accountId, name: primaryAccount.accountName || `${CARRIER_LABELS[carrier]} Primary` },
                        connections
                      )}
                      size="sm"
                    />
                  );
                })()}
                <Toggle
                  checked={primaryAccount.isActive}
                  onChange={() => handleToggleActive(primaryAccount.id, primaryAccount.isActive)}
                  label={primaryAccount.isActive ? 'Active' : 'Inactive'}
                />
                <button className="p-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-xl border-2 border-dashed border-border bg-gray-50">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h4 className="font-medium text-text-primary mb-1">No Primary Account</h4>
              <p className="text-sm text-text-muted mb-3">
                Set up a default {CARRIER_LABELS[carrier]} account for your tenant
              </p>
              <Button variant="primary" size="sm">
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Primary Account
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Accounts Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
            Secondary Accounts
          </h3>
          <Button variant="secondary" size="sm">
            <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Secondary Account
          </Button>
        </div>

        <p className="text-sm text-text-muted mb-4">
          Client-specific accounts override the primary account for individual customers
        </p>

        {secondaryAccounts.length > 0 ? (
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    Account Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    Last Updated
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    Connections
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {secondaryAccounts.map((account) => (
                  <tr
                    key={account.id}
                    className={`transition-colors ${
                      account.isActive
                        ? 'bg-white hover:bg-gray-50'
                        : 'bg-gray-50 opacity-60'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-text-primary">
                          {account.clientName || `Client #${account.clientId}`}
                        </div>
                        <div className="text-xs text-text-muted">
                          {account.accountName || account.carrierType}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-text-secondary">
                        {account.accountNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {formatDate(account.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      {onConnectionsClick && (() => {
                        const accountId = String(account.id);
                        const connData = sampleAccountConnections[accountId];
                        const connections = connData?.connections || createEmptyConnections();
                        const connectedCount = connData?.connectedCount || countConnectedCategories(connections);
                        return (
                          <ConnectionBadge
                            connectionCount={connectedCount}
                            hasIssues={connData?.hasIssues || false}
                            onClick={() => onConnectionsClick(
                              { type: 'service', id: accountId, name: account.accountName || `${account.clientName} Account` },
                              connections
                            )}
                            size="sm"
                          />
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <Toggle
                        checked={account.isActive}
                        onChange={() => handleToggleActive(account.id, account.isActive)}
                        label={account.isActive ? 'Active' : 'Inactive'}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-xl p-8 text-center bg-gray-50">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h4 className="font-medium text-text-primary mb-1">No Secondary Accounts</h4>
            <p className="text-sm text-text-muted">
              Add client-specific {CARRIER_LABELS[carrier]} accounts to override the primary account
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
