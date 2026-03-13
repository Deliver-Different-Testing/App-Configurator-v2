import { useState, useRef, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Toggle } from '../../../components/ui/Toggle';
import { Badge } from '../../../components/ui/Badge';
import type { NotificationTemplate, NotificationType } from '../types';
import { MERGE_FIELDS } from '../types';

// Inline Template Editor with Merge Field Picker

interface TemplateEditorProps {
  template: NotificationTemplate;
  onSave: (template: NotificationTemplate) => void;
  onCancel: () => void;
}

// Merge Field categories for organized picker
const MERGE_FIELD_CATEGORIES = {
  'Job Details': ['[JobNumber]', '[TrackingLink]', '[Date]', '[Time]'],
  'Customer': ['[CustomerName]', '[PickupAddress]', '[DeliveryAddress]'],
  'Driver': ['[DriverName]', '[ETATime]'],
  'Documents': ['[PODLink]', '[InvoiceNumber]', '[Amount]'],
};

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<NotificationTemplate>({ ...template });
  const [showMergeFieldPicker, setShowMergeFieldPicker] = useState(false);
  const [editorMode, setEditorMode] = useState<'rich' | 'html'>('rich');
  const [activeField, setActiveField] = useState<'subject' | 'body'>('body');

  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const mergeFieldPickerRef = useRef<HTMLDivElement>(null);

  // SMS character count
  const smsCharCount = editedTemplate.body.length;
  const smsSegments = Math.ceil(smsCharCount / 160);

  // Close merge field picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mergeFieldPickerRef.current && !mergeFieldPickerRef.current.contains(event.target as Node)) {
        setShowMergeFieldPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const insertMergeField = (field: string) => {
    if (activeField === 'subject' && subjectRef.current) {
      const input = subjectRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = editedTemplate.subject!.slice(0, start) + field + editedTemplate.subject!.slice(end);
      setEditedTemplate({ ...editedTemplate, subject: newValue });

      // Set cursor after inserted field
      setTimeout(() => {
        input.setSelectionRange(start + field.length, start + field.length);
        input.focus();
      }, 0);
    } else if (activeField === 'body' && bodyRef.current) {
      const textarea = bodyRef.current;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const newValue = editedTemplate.body.slice(0, start) + field + editedTemplate.body.slice(end);
      setEditedTemplate({ ...editedTemplate, body: newValue });

      setTimeout(() => {
        textarea.setSelectionRange(start + field.length, start + field.length);
        textarea.focus();
      }, 0);
    }

    // Update merge fields list
    if (!editedTemplate.mergeFields.includes(field)) {
      setEditedTemplate(prev => ({
        ...prev,
        mergeFields: [...prev.mergeFields, field]
      }));
    }

    setShowMergeFieldPicker(false);
  };

  const handleSave = () => {
    // Extract used merge fields from content
    const usedFields = MERGE_FIELDS.filter(
      field => editedTemplate.body.includes(field) || editedTemplate.subject?.includes(field)
    );
    onSave({ ...editedTemplate, mergeFields: usedFields });
  };

  const getChannelIcon = (channel: NotificationType) => {
    switch (channel) {
      case 'email':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        );
      case 'sms':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        );
      case 'push':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-brand-cyan rounded-lg shadow-lg overflow-hidden">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-brand-cyan/5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded flex items-center justify-center ${
            editedTemplate.channel === 'email' ? 'bg-blue-100 text-blue-600' :
            editedTemplate.channel === 'sms' ? 'bg-green-100 text-green-600' :
            'bg-purple-100 text-purple-600'
          }`}>
            {getChannelIcon(editedTemplate.channel)}
          </div>
          <div>
            <h4 className="text-sm font-medium text-text-primary">
              Edit {editedTemplate.channel.toUpperCase()} Template
            </h4>
            <p className="text-xs text-text-secondary">Template ID: {editedTemplate.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Toggle
            checked={editedTemplate.isActive}
            onChange={(checked) => setEditedTemplate({ ...editedTemplate, isActive: checked })}
            label={editedTemplate.isActive ? 'Active' : 'Inactive'}
          />
        </div>
      </div>

      {/* Merge Field Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-surface-light border-b border-border">
        <div className="relative" ref={mergeFieldPickerRef}>
          <button
            onClick={() => setShowMergeFieldPicker(!showMergeFieldPicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-border rounded-md hover:border-brand-cyan transition-colors"
          >
            <svg className="w-4 h-4 text-brand-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Insert Merge Field
            <svg className={`w-3 h-3 transition-transform ${showMergeFieldPicker ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Merge Field Picker Dropdown */}
          {showMergeFieldPicker && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-border rounded-lg shadow-lg z-50">
              <div className="p-2 border-b border-border">
                <span className="text-xs font-medium text-text-muted uppercase">Available Merge Fields</span>
              </div>
              <div className="max-h-64 overflow-y-auto p-2 space-y-3">
                {Object.entries(MERGE_FIELD_CATEGORIES).map(([category, fields]) => (
                  <div key={category}>
                    <div className="text-xs font-medium text-text-secondary mb-1.5">{category}</div>
                    <div className="flex flex-wrap gap-1">
                      {fields.map((field) => (
                        <button
                          key={field}
                          onClick={() => insertMergeField(field)}
                          className="px-2 py-1 text-xs bg-brand-cyan/10 text-brand-cyan rounded hover:bg-brand-cyan/20 transition-colors"
                        >
                          {field}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Insert Buttons */}
        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border">
          {['[JobNumber]', '[CustomerName]', '[TrackingLink]'].map((field) => (
            <button
              key={field}
              onClick={() => insertMergeField(field)}
              className="px-2 py-1 text-xs bg-gray-100 text-text-secondary rounded hover:bg-brand-cyan/10 hover:text-brand-cyan transition-colors"
            >
              {field}
            </button>
          ))}
        </div>

        {/* Mode Toggle for Email */}
        {editedTemplate.channel === 'email' && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setEditorMode('rich')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                editorMode === 'rich' ? 'bg-brand-cyan text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              Rich Editor
            </button>
            <button
              onClick={() => setEditorMode('html')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                editorMode === 'html' ? 'bg-brand-cyan text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              HTML Code
            </button>
          </div>
        )}

        {/* SMS Character Counter */}
        {editedTemplate.channel === 'sms' && (
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className={smsCharCount > 160 ? 'text-warning' : 'text-text-secondary'}>
              {smsCharCount}/160 characters
            </span>
            {smsSegments > 1 && (
              <Badge variant="yellow">{smsSegments} segments</Badge>
            )}
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="p-4 space-y-4">
        {/* Subject Line (Email only) */}
        {editedTemplate.channel === 'email' && (
          <div>
            <label className="block text-xs text-text-secondary mb-1">Subject Line</label>
            <input
              ref={subjectRef}
              type="text"
              value={editedTemplate.subject || ''}
              onChange={(e) => setEditedTemplate({ ...editedTemplate, subject: e.target.value })}
              onFocus={() => setActiveField('subject')}
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20"
              placeholder="Enter email subject..."
            />
          </div>
        )}

        {/* Message Body */}
        <div>
          <label className="block text-xs text-text-secondary mb-1">
            {editedTemplate.channel === 'email' ? 'Email Body' : 'Message'}
          </label>
          <textarea
            ref={bodyRef}
            value={editedTemplate.body}
            onChange={(e) => setEditedTemplate({ ...editedTemplate, body: e.target.value })}
            onFocus={() => setActiveField('body')}
            rows={editedTemplate.channel === 'sms' ? 4 : 8}
            className={`w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 resize-none ${
              editorMode === 'html' ? 'font-mono text-xs' : ''
            }`}
            placeholder={`Enter ${editedTemplate.channel} message...`}
          />
        </div>

        {/* Used Merge Fields Preview */}
        <div>
          <label className="block text-xs text-text-secondary mb-2">Merge Fields Used</label>
          <div className="flex flex-wrap gap-1.5">
            {MERGE_FIELDS.filter(
              field => editedTemplate.body.includes(field) || editedTemplate.subject?.includes(field)
            ).map((field) => (
              <span
                key={field}
                className="px-2 py-1 text-xs bg-brand-cyan/10 text-brand-cyan rounded flex items-center gap-1"
              >
                {field}
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            ))}
            {!MERGE_FIELDS.some(
              field => editedTemplate.body.includes(field) || editedTemplate.subject?.includes(field)
            ) && (
              <span className="text-xs text-text-muted italic">No merge fields in use</span>
            )}
          </div>
        </div>
      </div>

      {/* Editor Footer */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-light border-t border-border">
        <button
          onClick={onCancel}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save Template
          </Button>
        </div>
      </div>
    </div>
  );
}
