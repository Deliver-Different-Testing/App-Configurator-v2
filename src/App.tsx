import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TerritoryPage } from './modules/territory';
import { ClientsPage } from './modules/clients';
import { NotificationsPage } from './modules/notifications';
import { TasksPage } from './modules/tasks';
import { AutomationsPage } from './modules/automations';
import { SchedulesPage } from './modules/schedules';
import { IntegrationsHubPage } from './modules/integrations-hub';
import { SetupWizard } from './features/setup-wizard';

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
    },
  },
});

// Import sample data for import/export functionality
import { sampleClients } from './modules/clients/data/sampleData';
import { zipZonesData, zoneGroupsData, depotsData } from './modules/territory/data/sampleData';
import { sampleNotificationGroups } from './modules/notifications/data/sampleData';

// Import the data service for in-memory persistence
import { initializeDataStore, getAllData, subscribeToChanges } from './features/import-export/services/importService';

type ModuleId = 'clients' | 'agents' | 'drivers' | 'vehicle-management' | 'holidays' | 'rates' |
  'customer-contacts' | 'billing-types' | 'job-settings' | 'sources' | 'airports' |
  'staff-users' | 'client-users' |
  'tasks' | 'schedules' | 'notifications' | 'automations' | 'territory' | 'dashboards' | 'site-settings' |
  'integrations-hub';

interface MenuItem {
  id: ModuleId;
  label: string;
  icon?: ReactNode;
  children?: MenuItem[];
}

interface MenuSection {
  id: string;
  label: string;
  icon: ReactNode;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    id: 'general',
    label: 'General',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    items: [
      { id: 'clients', label: 'Clients & Customers' },
      { id: 'agents', label: 'Agents' },
      { id: 'drivers', label: 'Drivers', children: [
        { id: 'vehicle-management', label: 'Vehicle Management' },
      ] },
      { id: 'holidays', label: 'Holidays / Afterhours' },
      { id: 'rates', label: 'Rates & Accessorials' },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    items: [
      { id: 'customer-contacts', label: 'Customer Contacts' },
      { id: 'billing-types', label: 'Billing Types' },
      { id: 'job-settings', label: 'Job Settings' },
      { id: 'sources', label: 'Sources' },
      { id: 'airports', label: 'Airports & Airfreight' },
    ],
  },
  {
    id: 'users',
    label: 'Users & Permissions',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    items: [
      { id: 'staff-users', label: 'Staff & Admin Users' },
      { id: 'client-users', label: 'Customer/Client Users' },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    items: [
      { id: 'tasks', label: 'Tasks' },
      { id: 'schedules', label: 'Schedules' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'automations', label: 'Automations' },
      { id: 'territory', label: 'Territory & Locations' },
      { id: 'integrations-hub', label: 'Integrations Hub' },
      { id: 'dashboards', label: 'Dashboards' },
      { id: 'site-settings', label: 'Site Settings & Integrations' },
    ],
  },
];

// Modules that are implemented
const IMPLEMENTED_MODULES: ModuleId[] = ['clients', 'territory', 'notifications', 'tasks', 'schedules', 'automations', 'integrations-hub'];

// Helper to find which section contains a module
const findSectionForModule = (moduleId: ModuleId): string | null => {
  for (const section of MENU_SECTIONS) {
    for (const item of section.items) {
      if (item.id === moduleId) return section.id;
      if (item.children?.some(child => child.id === moduleId)) return section.id;
    }
  }
  return null;
};

// Initial data for the import service
const INITIAL_DATA: Record<string, Record<string, unknown>[]> = {
  clients: sampleClients as unknown as Record<string, unknown>[],
  zipZones: zipZonesData as unknown as Record<string, unknown>[],
  zoneGroups: zoneGroupsData as unknown as Record<string, unknown>[],
  depots: depotsData as unknown as Record<string, unknown>[],
  notificationGroups: sampleNotificationGroups as unknown as Record<string, unknown>[],
};

// Initialize the data store once at module load
initializeDataStore(INITIAL_DATA);

function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('territory');
  // Start with only the active module's section expanded
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const section = findSectionForModule('territory');
    return section ? [section] : [];
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  // Reactive data state - updates when imports complete
  const [existingData, setExistingData] = useState<Record<string, Record<string, unknown>[]>>(getAllData);

  // Subscribe to data changes from the import service
  useEffect(() => {
    const unsubscribe = subscribeToChanges((schemaId, data) => {
      setExistingData(prev => ({
        ...prev,
        [schemaId]: data,
      }));
    });
    return unsubscribe;
  }, []);

  // Force refresh data when wizard opens (in case of external changes)
  const handleWizardOpen = useCallback(() => {
    setExistingData(getAllData());
    setWizardOpen(true);
  }, []);

  // Toggle section - pure toggle behavior for section headers
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [sectionId] // Accordion: only one section open at a time
    );
  };

  // Select module and auto-expand its section (collapse others)
  const selectModule = (moduleId: ModuleId) => {
    setActiveModule(moduleId);
    const sectionId = findSectionForModule(moduleId);
    if (sectionId) {
      setExpandedSections([sectionId]); // Only this section expanded
    }
  };

  const isImplemented = (moduleId: ModuleId) => IMPLEMENTED_MODULES.includes(moduleId);

  const renderModule = () => {
    switch (activeModule) {
      case 'territory':
        return <TerritoryPage />;
      case 'clients':
        return <ClientsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'tasks':
        return <TasksPage />;
      case 'schedules':
        return <SchedulesPage />;
      case 'automations':
        return <AutomationsPage />;
      case 'integrations-hub':
        return <IntegrationsHubPage />;
      default:
        return (
          <div className="min-h-screen bg-surface-light flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-border flex items-center justify-center">
                <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                {MENU_SECTIONS.flatMap(s => s.items).find(i => i.id === activeModule)?.label}
              </h2>
              <p className="text-text-secondary">This module is ready for development</p>
            </div>
          </div>
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
    <div className="h-screen bg-surface-light flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-brand-dark flex flex-col h-screen sticky top-0 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-cyan flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-brand-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
                <circle cx="6.5" cy="16.5" r="2.5" />
                <circle cx="16.5" cy="16.5" r="2.5" />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-base font-bold text-white whitespace-nowrap">Deliver Different</h1>
                <p className="text-xs text-white/50 whitespace-nowrap">Admin Settings</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 min-h-0">
          {MENU_SECTIONS.map((section) => (
            <div key={section.id} className="mb-2">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <span className="text-white/70">{section.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium text-white/90">{section.label}</span>
                    <svg
                      className={`w-4 h-4 text-white/50 transition-transform ${
                        expandedSections.includes(section.id) ? 'rotate-180' : ''
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </>
                )}
              </button>

              {/* Section Items */}
              {!sidebarCollapsed && expandedSections.includes(section.id) && (
                <div className="mt-1 space-y-1 menu-section-items">
                  {section.items.map((item) => {
                    const implemented = isImplemented(item.id);
                    const isActive = activeModule === item.id;
                    const hasChildren = item.children && item.children.length > 0;
                    const childActive = hasChildren && item.children?.some(child => activeModule === child.id);

                    return (
                      <div key={item.id}>
                        <button
                          onClick={() => selectModule(item.id)}
                          className={`w-full flex items-center gap-3 pl-12 pr-4 py-2.5 text-left transition-all duration-150 ${
                            isActive || childActive
                              ? 'bg-brand-cyan/20 text-brand-cyan border-r-2 border-brand-cyan'
                              : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                          }`}
                        >
                          <span className="text-sm">{item.label}</span>
                          {implemented && (
                            <span className="ml-auto w-2 h-2 rounded-full bg-brand-cyan" title="Implemented" />
                          )}
                        </button>
                        {/* Nested children */}
                        {hasChildren && item.children?.map((child) => {
                          const childImplemented = isImplemented(child.id);
                          const childIsActive = activeModule === child.id;
                          return (
                            <button
                              key={child.id}
                              onClick={() => selectModule(child.id)}
                              className={`w-full flex items-center gap-3 pl-16 pr-4 py-2 text-left transition-all duration-150 ${
                                childIsActive
                                  ? 'bg-brand-cyan/20 text-brand-cyan border-r-2 border-brand-cyan'
                                  : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                              }`}
                            >
                              <span className="text-xs">• {child.label}</span>
                              {childImplemented && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-cyan" title="Implemented" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Import & Export - Meta Feature */}
        <div className="px-3 py-2 border-t border-white/10 flex-shrink-0">
          <button
            onClick={handleWizardOpen}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
              bg-brand-cyan/10 hover:bg-brand-cyan/20
              border border-brand-cyan/30 hover:border-brand-cyan/50
              ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <svg className="w-5 h-5 text-brand-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {!sidebarCollapsed && (
              <span className="text-sm font-medium text-brand-cyan">Import & Export</span>
            )}
          </button>
        </div>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-white/50 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {!sidebarCollapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>

        {/* User */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-purple flex items-center justify-center text-white text-sm font-medium">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin User</p>
                <p className="text-xs text-white/50 truncate">admin@deliverdifferent.com</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderModule()}
      </main>

      {/* Setup Wizard Modal */}
      <SetupWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        existingData={existingData}
        onComplete={() => {
          // Optionally refresh data or show toast
          console.log('Setup wizard completed');
        }}
      />
    </div>
    </QueryClientProvider>
  );
}

export default App;
