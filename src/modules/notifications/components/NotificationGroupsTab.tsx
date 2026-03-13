import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Toggle } from '../../../components/ui/Toggle';
import { ConnectionBadge } from '../../../components/tags/ConnectionBadge';
import { TemplateEditor } from './TemplateEditor';
import type { NotificationGroup, NotificationTemplate, EntityConnections, SourceItem } from '../types';
import { TRIGGER_EVENT_LABELS, createEmptyConnections } from '../types';
import { sampleNotificationConnections } from '../data/sampleData';

interface NotificationGroupsTabProps {
  groups: NotificationGroup[];
  onConnectionsClick?: (sourceItem: SourceItem, connections: EntityConnections) => void;
}

function countConnectedCategories(connections: EntityConnections): number {
  return Object.values(connections).filter(c => c.hasConnections).length;
}

export function NotificationGroupsTab({ groups, onConnectionsClick }: NotificationGroupsTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [localGroups, setLocalGroups] = useState(groups);
  const [editingTemplate, setEditingTemplate] = useState<{groupId: string; template: NotificationTemplate} | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleActive = (id: string) => {
    setLocalGroups(localGroups.map(g =>
      g.id === id ? { ...g, isActive: !g.isActive } : g
    ));
  };

  const toggleChannel = (groupId: string, channel: keyof NotificationGroup['channels']) => {
    setLocalGroups(localGroups.map(g =>
      g.id === groupId ? { ...g, channels: { ...g.channels, [channel]: !g.channels[channel] } } : g
    ));
  };

  const handleConnectionsClick = (group: NotificationGroup) => {
    const connections = sampleNotificationConnections[group.id] || createEmptyConnections();
    onConnectionsClick?.({
      type: 'service', // Treat notifications as a service for routing
      id: group.id,
      name: group.name,
    }, connections);
  };

  const handleEditTemplate = (groupId: string, template: NotificationTemplate) => {
    setEditingTemplate({ groupId, template });
  };

  const handleSaveTemplate = (updatedTemplate: NotificationTemplate) => {
    setLocalGroups(localGroups.map(g => {
      if (g.id === editingTemplate?.groupId) {
        return {
          ...g,
          templates: g.templates.map(t =>
            t.id === updatedTemplate.id ? updatedTemplate : t
          )
        };
      }
      return g;
    }));
    setEditingTemplate(null);
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Notification Groups</h3>
        <p className="text-sm text-text-secondary mt-1">
          Configure automated notifications for different events
        </p>
      </div>

      {/* Groups List */}
      <div className="space-y-3">
        {localGroups.map((group) => {
          const isExpanded = expandedId === group.id;
          const connections = sampleNotificationConnections[group.id] || createEmptyConnections();

          return (
            <div
              key={group.id}
              className={`border rounded-lg transition-all duration-200 ${
                isExpanded ? 'border-brand-cyan shadow-md' : 'border-border'
              } ${!group.isActive ? 'opacity-60' : ''}`}
            >
              {/* Row Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-light"
                onClick={() => toggleExpand(group.id)}
              >
                <div className="flex items-center gap-4">
                  {/* Status Indicator */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    group.isActive ? 'bg-brand-cyan/10 text-brand-cyan' : 'bg-gray-100 text-text-muted'
                  }`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary">{group.name}</span>
                      <Badge variant={group.isActive ? 'green' : 'default'}>
                        {group.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-text-secondary">{group.description}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Trigger Event */}
                  <Badge variant="purple">
                    {TRIGGER_EVENT_LABELS[group.triggerEvent]}
                  </Badge>

                  {/* Channels */}
                  <div className="flex gap-2">
                    {group.channels.email && (
                      <span className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center" title="Email">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </span>
                    )}
                    {group.channels.sms && (
                      <span className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center" title="SMS">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </span>
                    )}
                    {group.channels.push && (
                      <span className="w-8 h-8 rounded bg-purple-100 text-purple-600 flex items-center justify-center" title="Push">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        </svg>
                      </span>
                    )}
                    {group.channels.webhook && (
                      <span className="w-8 h-8 rounded bg-orange-100 text-orange-600 flex items-center justify-center" title="Webhook">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="16 18 22 12 16 6" />
                          <polyline points="8 6 2 12 8 18" />
                        </svg>
                      </span>
                    )}
                  </div>

                  {/* Connections */}
                  <ConnectionBadge
                    connectionCount={countConnectedCategories(connections)}
                    onClick={(e) => { e?.stopPropagation(); handleConnectionsClick(group); }}
                    size="sm"
                  />

                  {/* Chevron */}
                  <svg
                    className={`w-5 h-5 text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-border p-6 bg-surface-light">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Channels Configuration */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-text-secondary">Channels</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <span className="text-sm">Email</span>
                          </div>
                          <Toggle
                            checked={group.channels.email}
                            onChange={() => toggleChannel(group.id, 'email')}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span className="text-sm">SMS</span>
                          </div>
                          <Toggle
                            checked={group.channels.sms}
                            onChange={() => toggleChannel(group.id, 'sms')}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            </svg>
                            <span className="text-sm">Push</span>
                          </div>
                          <Toggle
                            checked={group.channels.push}
                            onChange={() => toggleChannel(group.id, 'push')}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="16 18 22 12 16 6" />
                              <polyline points="8 6 2 12 8 18" />
                            </svg>
                            <span className="text-sm">Webhook</span>
                          </div>
                          <Toggle
                            checked={group.channels.webhook}
                            onChange={() => toggleChannel(group.id, 'webhook')}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Templates Preview */}
                    <div className="space-y-4 col-span-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-text-secondary">Templates</h4>
                        <span className="text-xs text-text-muted">Click a template to edit</span>
                      </div>
                      <div className="space-y-3">
                        {group.templates.map((template) => {
                          const isEditing = editingTemplate?.template.id === template.id;

                          if (isEditing) {
                            return (
                              <TemplateEditor
                                key={template.id}
                                template={editingTemplate.template}
                                onSave={handleSaveTemplate}
                                onCancel={handleCancelEdit}
                              />
                            );
                          }

                          return (
                            <div
                              key={template.id}
                              onClick={() => handleEditTemplate(group.id, template)}
                              className="bg-white border border-border rounded-lg p-4 cursor-pointer hover:border-brand-cyan hover:shadow-sm transition-all group"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={template.channel === 'email' ? 'blue' : template.channel === 'sms' ? 'green' : 'purple'}>
                                    {template.channel.toUpperCase()}
                                  </Badge>
                                  <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                    Click to edit
                                  </span>
                                </div>
                                <Toggle
                                  checked={template.isActive}
                                  onChange={() => {}}
                                  label={template.isActive ? 'Active' : 'Inactive'}
                                />
                              </div>
                              {template.subject && (
                                <div className="text-sm font-medium text-text-primary mb-1">
                                  Subject: {template.subject}
                                </div>
                              )}
                              <div className="text-sm text-text-secondary whitespace-pre-wrap line-clamp-3">
                                {template.body}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {template.mergeFields.map((field) => (
                                  <span
                                    key={field}
                                    className="text-xs px-2 py-0.5 bg-brand-cyan/10 text-brand-cyan rounded"
                                  >
                                    {field}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {group.tags && group.tags.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-secondary">Tags:</span>
                        {group.tags.map((tag) => (
                          <Badge key={tag} variant="default">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                    <Toggle
                      checked={group.isActive}
                      onChange={() => toggleActive(group.id)}
                      label={group.isActive ? 'Notification Active' : 'Notification Inactive'}
                    />
                    <div className="flex gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (group.templates.length > 0 && !editingTemplate) {
                            handleEditTemplate(group.id, group.templates[0]);
                          }
                        }}
                      >
                        {editingTemplate?.groupId === group.id ? 'Editing...' : 'Edit Templates'}
                      </Button>
                      <Button variant="secondary" size="sm">Test Send</Button>
                      <Button variant="primary" size="sm">Save Changes</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
