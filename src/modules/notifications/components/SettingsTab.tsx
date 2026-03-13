import { useState } from 'react';
import { Toggle } from '../../../components/ui/Toggle';
import { Button } from '../../../components/ui/Button';
// Notification Settings Tab Component

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  webhookEnabled: boolean;
  defaultFromEmail: string;
  defaultFromName: string;
  smsSenderId: string;
  webhookSecret: string;
  retryAttempts: number;
  retryDelay: number;
  batchSize: number;
  dailyLimit: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

const defaultSettings: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: true,
  pushEnabled: true,
  webhookEnabled: true,
  defaultFromEmail: 'notifications@deliverdifferent.com',
  defaultFromName: 'Deliver Different',
  smsSenderId: 'DELDIFF',
  webhookSecret: '••••••••••••••••',
  retryAttempts: 3,
  retryDelay: 30,
  batchSize: 100,
  dailyLimit: 10000,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

export function SettingsTab() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save settings (would call API in real implementation)
    console.log('Saving settings:', settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Notification Settings</h3>
          <p className="text-sm text-text-secondary mt-1">
            Configure global notification settings and defaults
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleReset} disabled={!hasChanges}>
            Reset
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Channel Configuration */}
      <div className="bg-white border border-border rounded-lg p-6">
        <h4 className="text-sm font-medium text-text-primary mb-4">Channel Configuration</h4>
        <div className="grid grid-cols-2 gap-6">
          {/* Email Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <span className="font-medium text-text-primary">Email Notifications</span>
              </div>
              <Toggle
                checked={settings.emailEnabled}
                onChange={(checked) => updateSetting('emailEnabled', checked)}
              />
            </div>
            {settings.emailEnabled && (
              <div className="space-y-3 pl-11">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">From Email</label>
                  <input
                    type="email"
                    value={settings.defaultFromEmail}
                    onChange={(e) => updateSetting('defaultFromEmail', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">From Name</label>
                  <input
                    type="text"
                    value={settings.defaultFromName}
                    onChange={(e) => updateSetting('defaultFromName', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SMS Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="font-medium text-text-primary">SMS Notifications</span>
              </div>
              <Toggle
                checked={settings.smsEnabled}
                onChange={(checked) => updateSetting('smsEnabled', checked)}
              />
            </div>
            {settings.smsEnabled && (
              <div className="space-y-3 pl-11">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Sender ID</label>
                  <input
                    type="text"
                    value={settings.smsSenderId}
                    onChange={(e) => updateSetting('smsSenderId', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-brand-cyan"
                    maxLength={11}
                  />
                  <span className="text-xs text-text-muted">Max 11 characters</span>
                </div>
              </div>
            )}
          </div>

          {/* Push Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <span className="font-medium text-text-primary">Push Notifications</span>
              </div>
              <Toggle
                checked={settings.pushEnabled}
                onChange={(checked) => updateSetting('pushEnabled', checked)}
              />
            </div>
            {settings.pushEnabled && (
              <div className="pl-11">
                <p className="text-xs text-text-muted">Configured via mobile app settings</p>
              </div>
            )}
          </div>

          {/* Webhook Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <span className="font-medium text-text-primary">Webhook Notifications</span>
              </div>
              <Toggle
                checked={settings.webhookEnabled}
                onChange={(checked) => updateSetting('webhookEnabled', checked)}
              />
            </div>
            {settings.webhookEnabled && (
              <div className="space-y-3 pl-11">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Signing Secret</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={settings.webhookSecret}
                      onChange={(e) => updateSetting('webhookSecret', e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-brand-cyan"
                    />
                    <Button variant="secondary" size="sm">Regenerate</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="bg-white border border-border rounded-lg p-6">
        <h4 className="text-sm font-medium text-text-primary mb-4">Delivery Settings</h4>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-xs text-text-secondary mb-1">Retry Attempts</label>
            <input
              type="number"
              value={settings.retryAttempts}
              onChange={(e) => updateSetting('retryAttempts', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-brand-cyan"
              min={0}
              max={10}
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Retry Delay (seconds)</label>
            <input
              type="number"
              value={settings.retryDelay}
              onChange={(e) => updateSetting('retryDelay', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-brand-cyan"
              min={5}
              max={300}
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Batch Size</label>
            <input
              type="number"
              value={settings.batchSize}
              onChange={(e) => updateSetting('batchSize', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-brand-cyan"
              min={1}
              max={1000}
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Daily Limit</label>
            <input
              type="number"
              value={settings.dailyLimit}
              onChange={(e) => updateSetting('dailyLimit', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-brand-cyan"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium text-text-primary">Quiet Hours</h4>
            <p className="text-xs text-text-secondary mt-1">
              Pause non-urgent notifications during specified hours
            </p>
          </div>
          <Toggle
            checked={settings.quietHoursEnabled}
            onChange={(checked) => updateSetting('quietHoursEnabled', checked)}
          />
        </div>
        {settings.quietHoursEnabled && (
          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Start Time</label>
              <input
                type="time"
                value={settings.quietHoursStart}
                onChange={(e) => updateSetting('quietHoursStart', e.target.value)}
                className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-brand-cyan"
              />
            </div>
            <span className="text-text-muted mt-5">to</span>
            <div>
              <label className="block text-xs text-text-secondary mb-1">End Time</label>
              <input
                type="time"
                value={settings.quietHoursEnd}
                onChange={(e) => updateSetting('quietHoursEnd', e.target.value)}
                className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-brand-cyan"
              />
            </div>
            <div className="ml-auto text-sm text-text-secondary">
              Notifications will be queued and sent after quiet hours end
            </div>
          </div>
        )}
      </div>

      {/* API Integration */}
      <div className="bg-white border border-border rounded-lg p-6">
        <h4 className="text-sm font-medium text-text-primary mb-4">API Integration</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
            <div>
              <div className="font-medium text-text-primary">SendGrid</div>
              <div className="text-sm text-text-secondary">Email delivery service</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Connected
              </span>
              <Button variant="secondary" size="sm">Configure</Button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
            <div>
              <div className="font-medium text-text-primary">Twilio</div>
              <div className="text-sm text-text-secondary">SMS delivery service</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Connected
              </span>
              <Button variant="secondary" size="sm">Configure</Button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
            <div>
              <div className="font-medium text-text-primary">Firebase Cloud Messaging</div>
              <div className="text-sm text-text-secondary">Push notification service</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm text-yellow-600">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Partial
              </span>
              <Button variant="secondary" size="sm">Configure</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
