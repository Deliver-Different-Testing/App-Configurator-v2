import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/layout/Tabs';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
import { TagSidebar, ConnectionBadge } from '../../components/tags';
import { CarrierAccountsTab } from './components/CarrierAccountsTab';
import { ServiceMappingsTab } from './components/ServiceMappingsTab';
import { FedExSetupTab } from './components/FedExSetupTab';
import { ZoneMappingsTab } from './components/ZoneMappingsTab';
import { RateCalculatorTab } from './components/RateCalculatorTab';
import { TrackingMappingsTab } from './components/TrackingMappingsTab';
import { TroubleshootingLogs } from './components/TroubleshootingLogs';
import { sampleCarrierConnections } from './data/sampleData';
import type { CarrierType, IntegrationCategory, IntegrationType, EntityConnections, SourceItem } from './types';
import { createEmptyConnections } from './types';

interface Integration {
  id: IntegrationType;
  name: string;
  description: string;
  status: 'connected' | 'warning' | 'disconnected' | 'coming_soon';
  accountCount: number;
  activeMappings: number;
  category: IntegrationCategory;
  logo: React.ReactNode;
}

const integrations: Integration[] = [
  // Freight Integrations
  {
    id: 'fedex',
    name: 'FedEx',
    description: 'Ground, Express, and Freight services',
    status: 'connected',
    accountCount: 2,
    activeMappings: 3,
    category: 'freight',
    logo: (
      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
        <span className="text-purple-700 font-bold text-lg">FX</span>
      </div>
    ),
  },
  {
    id: 'ups',
    name: 'UPS',
    description: 'Ground, Next Day Air, and more',
    status: 'connected',
    accountCount: 1,
    activeMappings: 1,
    category: 'freight',
    logo: (
      <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
        <span className="text-amber-700 font-bold text-lg">UPS</span>
      </div>
    ),
  },
  {
    id: 'usps',
    name: 'USPS',
    description: 'Priority Mail, First Class, Parcel Select',
    status: 'disconnected',
    accountCount: 0,
    activeMappings: 0,
    category: 'freight',
    logo: (
      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
        <span className="text-blue-700 font-bold text-lg">US</span>
      </div>
    ),
  },
  {
    id: 'dhl',
    name: 'DHL',
    description: 'International Express shipping',
    status: 'warning',
    accountCount: 0,
    activeMappings: 0,
    category: 'freight',
    logo: (
      <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
        <span className="text-red-700 font-bold text-lg">DHL</span>
      </div>
    ),
  },
  // Financial Integrations
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting and invoicing integration',
    status: 'coming_soon',
    accountCount: 0,
    activeMappings: 0,
    category: 'financial',
    logo: (
      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
        <span className="text-green-700 font-bold text-lg">QB</span>
      </div>
    ),
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Cloud-based accounting platform',
    status: 'coming_soon',
    accountCount: 0,
    activeMappings: 0,
    category: 'financial',
    logo: (
      <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center">
        <span className="text-sky-700 font-bold text-lg">XO</span>
      </div>
    ),
  },
  // Other Integrations
  {
    id: 'openforce',
    name: 'Openforce',
    description: 'Contractor management platform',
    status: 'coming_soon',
    accountCount: 0,
    activeMappings: 0,
    category: 'other',
    logo: (
      <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
        <span className="text-indigo-700 font-bold text-lg">OF</span>
      </div>
    ),
  },
];

// Calculate totals for dashboard
const freightIntegrations = integrations.filter(i => i.category === 'freight');
const totalAccounts = freightIntegrations.reduce((sum, i) => sum + i.accountCount, 0);
const activeAccounts = freightIntegrations.filter(i => i.status === 'connected').reduce((sum, i) => sum + i.accountCount, 0);
const totalMappings = freightIntegrations.reduce((sum, i) => sum + i.activeMappings, 0);
const connectedCarriers = freightIntegrations.filter(i => i.status === 'connected').length;

const getStatusBadge = (status: Integration['status']) => {
  switch (status) {
    case 'connected':
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-green-700">Connected</span>
        </div>
      );
    case 'warning':
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs text-amber-700">Setup Required</span>
        </div>
      );
    case 'disconnected':
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-xs text-gray-600">Not Connected</span>
        </div>
      );
    case 'coming_soon':
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-brand-cyan" />
          <span className="text-xs text-brand-cyan">Coming Soon</span>
        </div>
      );
  }
};

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  return (
    <div className={`p-5 rounded-xl border border-border bg-white relative overflow-hidden`}>
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full ${color} opacity-10`} />
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-text-primary mb-0.5">{value}</div>
      <div className="text-sm text-text-secondary">{title}</div>
      <div className="text-xs text-text-muted mt-1">{subtitle}</div>
    </div>
  );
}

const categoryTabs: { id: IntegrationCategory; label: string }[] = [
  { id: 'freight', label: 'Freight' },
  { id: 'financial', label: 'Financial' },
  { id: 'other', label: 'Other' },
];

export function IntegrationsHubPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType | null>(null);
  const [activeTab, setActiveTab] = useState('setup');
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory>('freight');

  // Tag Sidebar state
  const [tagSidebarOpen, setTagSidebarOpen] = useState(false);
  const [sidebarSourceItem, setSidebarSourceItem] = useState<SourceItem>({
    type: 'service',
    id: '',
    name: '',
  });
  const [sidebarConnections, setSidebarConnections] = useState<EntityConnections>(createEmptyConnections());

  // Handle opening the sidebar for a specific item
  const handleConnectionsClick = (sourceItem: SourceItem, connections: EntityConnections) => {
    setSidebarSourceItem(sourceItem);
    setSidebarConnections(connections);
    setTagSidebarOpen(true);
  };

  // Handle navigation from the sidebar
  const handleNavigate = (targetRoute: string, searchQuery: string) => {
    console.log(`Navigate to ${targetRoute}?tagSearch=${searchQuery}`);
    // In a real app, this would use a router
  };

  // Tabs for carrier detail view - reordered with Setup Wizard first, removed Fuel Surcharges and Contract Tiers
  const detailTabs = [
    { id: 'setup', label: 'Setup Wizard' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'service-mappings', label: 'Service Mappings' },
    { id: 'tracking-mappings', label: 'Tracking Mappings' },
    { id: 'zone-mappings', label: 'Zone Mappings' },
    { id: 'rate-calculator', label: 'Rate Calculator' },
  ];

  const filteredIntegrations = integrations.filter(i => i.category === activeCategory);

  // Check if selected integration is a freight carrier (has full functionality)
  const isFreightIntegration = (id: IntegrationType): id is CarrierType => {
    return ['fedex', 'ups', 'usps', 'dhl'].includes(id);
  };

  // If an integration is selected, show its detail view
  if (selectedIntegration) {
    const integration = integrations.find(i => i.id === selectedIntegration);

    // For non-freight integrations, show coming soon
    if (!isFreightIntegration(selectedIntegration)) {
      return (
        <div className="min-h-screen bg-surface-light">
          <div className="px-6 pt-6 pb-3">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setSelectedIntegration(null)}
                className="p-2 -ml-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                {integration?.logo}
                <div>
                  <h1 className="text-2xl font-semibold text-text-primary">
                    {integration?.name} Integration
                  </h1>
                  <p className="text-text-secondary">{integration?.description}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <Card>
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-brand-cyan/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">Coming Soon</h2>
                <p className="text-text-secondary max-w-md mx-auto">
                  The {integration?.name} integration is currently under development.
                  Check back soon for updates on availability.
                </p>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-surface-light">
        {/* Header with back button */}
        <div className="px-6 pt-6 pb-3">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setSelectedIntegration(null)}
              className="p-2 -ml-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              {integration?.logo}
              <div>
                <h1 className="text-2xl font-semibold text-text-primary">
                  {integration?.name} Integration
                </h1>
                <p className="text-text-secondary">{integration?.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="px-6 pb-6">
          <Card padding="none">
            <Tabs tabs={detailTabs} activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="p-4">
              {activeTab === 'setup' && <FedExSetupTab carrier={selectedIntegration} />}
              {activeTab === 'accounts' && <CarrierAccountsTab carrier={selectedIntegration} onConnectionsClick={handleConnectionsClick} />}
              {activeTab === 'service-mappings' && <ServiceMappingsTab carrier={selectedIntegration} onConnectionsClick={handleConnectionsClick} />}
              {activeTab === 'tracking-mappings' && <TrackingMappingsTab carrier={selectedIntegration} />}
              {activeTab === 'zone-mappings' && <ZoneMappingsTab carrier={selectedIntegration} />}
              {activeTab === 'rate-calculator' && <RateCalculatorTab carrier={selectedIntegration} />}
            </div>
          </Card>
        </div>

        {/* Tag Sidebar - Connection Navigator */}
        <TagSidebar
          isOpen={tagSidebarOpen}
          onClose={() => setTagSidebarOpen(false)}
          sourceItem={sidebarSourceItem}
          connections={sidebarConnections}
          onNavigate={handleNavigate}
        />
      </div>
    );
  }

  // Dashboard overview
  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <PageHeader
          title="Integrations Hub"
          subtitle="Monitor and manage your carrier integrations"
          actions={
            <Button variant="primary">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Integration
            </Button>
          }
        />
      </div>

      {/* Stats Cards */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Carrier Accounts"
            value={totalAccounts}
            subtitle={`${activeAccounts} active`}
            color="bg-brand-cyan"
            icon={
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          />
          <StatCard
            title="Service Mappings"
            value={totalMappings}
            subtitle={`${totalMappings} active`}
            color="bg-secondary-purple"
            icon={
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            }
          />
          <StatCard
            title="Total Integrations"
            value={integrations.length}
            subtitle={`${integrations.filter(i => i.status === 'connected').length} connected`}
            color="bg-purple-500"
            icon={
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            }
          />
          <StatCard
            title="Connected Carriers"
            value={`${connectedCarriers}/${freightIntegrations.length}`}
            subtitle="FedEx, UPS active"
            color="bg-orange-500"
            icon={
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Troubleshooting & Logs */}
      <div className="px-6 mb-6">
        <TroubleshootingLogs />
      </div>

      {/* Integration Category Tabs */}
      <div className="px-6 mb-4">
        <div className="flex items-center gap-1 border-b border-border">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeCategory === tab.id
                  ? 'text-brand-cyan'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
              {activeCategory === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredIntegrations.map((integration) => {
            // Get connection data for freight carriers
            const carrierConnections = isFreightIntegration(integration.id)
              ? sampleCarrierConnections[integration.id]
              : null;

            return (
              <button
                key={integration.id}
                onClick={() => {
                  setSelectedIntegration(integration.id);
                  setActiveTab('setup');
                }}
                className="text-left p-5 rounded-xl border border-border bg-white hover:border-brand-cyan/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  {integration.logo}
                  <div className="flex-1">
                    <h4 className="font-semibold text-text-primary group-hover:text-brand-cyan transition-colors">
                      {integration.name}
                    </h4>
                    {getStatusBadge(integration.status)}
                  </div>
                </div>
                <p className="text-sm text-text-secondary mb-3">{integration.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">
                    {integration.status === 'coming_soon'
                      ? 'Coming soon'
                      : `${integration.accountCount} account${integration.accountCount !== 1 ? 's' : ''}`
                    }
                  </span>
                  {/* Connection Badge for freight carriers */}
                  {carrierConnections && integration.status !== 'coming_soon' ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <ConnectionBadge
                        connectionCount={carrierConnections.connectedCount}
                        hasIssues={carrierConnections.hasIssues}
                        onClick={() => handleConnectionsClick(
                          { type: 'service', id: integration.id, name: `${integration.name} Integration` },
                          carrierConnections.connections
                        )}
                        size="sm"
                      />
                    </div>
                  ) : (
                    <span className="text-brand-cyan font-medium group-hover:underline">
                      {integration.status === 'coming_soon' ? 'Learn More →' : 'Configure →'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag Sidebar - Connection Navigator */}
      <TagSidebar
        isOpen={tagSidebarOpen}
        onClose={() => setTagSidebarOpen(false)}
        sourceItem={sidebarSourceItem}
        connections={sidebarConnections}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default IntegrationsHubPage;
