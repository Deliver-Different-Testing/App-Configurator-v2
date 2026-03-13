import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/layout/Tabs';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
import { TagSidebar } from '../../components/tags';
import { TasksTab } from './components/TasksTab';
import { TaskGroupsTab } from './components/TaskGroupsTab';
import type { SourceItem, EntityConnections } from '../territory/types';
import { createEmptyConnections } from '../territory/types';

export function TasksPage() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tagSidebarOpen, setTagSidebarOpen] = useState(false);

  // State for the connection sidebar
  const [sidebarSourceItem, setSidebarSourceItem] = useState<SourceItem>({
    type: 'zipZone', // Will be 'task' or 'taskGroup' in practice
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
    // In a real app, this would use a router
    console.log(`Navigate to ${targetRoute}?tagSearch=${searchQuery}`);
    // Could switch tabs based on route
    if (targetRoute.includes('tab=groups') || targetRoute.includes('task-groups')) {
      setActiveTab('task-groups');
    } else if (targetRoute.includes('tasks')) {
      setActiveTab('tasks');
    }
  };

  const tabs = [
    { id: 'tasks', label: 'Tasks' },
    { id: 'task-groups', label: 'Task Groups' },
  ];

  // Dynamic button text based on active tab
  const getAddButtonText = () => {
    return activeTab === 'tasks' ? '+ New Task' : '+ New Task Group';
  };

  const handleAddNew = () => {
    // This will be wired up to create new task/group
    console.log(`Add new ${activeTab === 'tasks' ? 'task' : 'task group'}`);
  };

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <PageHeader
          title="Tasks Configuration"
          subtitle="Configure task templates and task groups for workflows"
          actions={
            <Button variant="primary" onClick={handleAddNew}>
              {getAddButtonText()}
            </Button>
          }
        />
      </div>

      {/* Main Content Card */}
      <div className="px-6 pb-6">
        <Card padding="none">
          {/* Sub-tabs at top of card */}
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'tasks' && (
              <TasksTab onConnectionsClick={handleConnectionsClick} />
            )}

            {activeTab === 'task-groups' && (
              <TaskGroupsTab onConnectionsClick={handleConnectionsClick} />
            )}
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

export default TasksPage;
