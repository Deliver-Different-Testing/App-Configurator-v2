import { useRef, useEffect, useCallback, useMemo, useReducer, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Toggle } from '../../../components/ui/Toggle';
import type { AttachmentField, AttachmentTemplate } from '../types';
import { createInitialEditorState, editorReducer } from '../attachment-builder/store/editorStore';
import { useAutosave } from '../attachment-builder/hooks/useAutosave';
import { canPublish } from '../attachment-builder/validation/validationEngine';
import { publishTemplates, saveDraft, VersionConflictError } from '../attachment-builder/api/templateApi';
import { AttachmentBuilderErrorBoundary } from '../attachment-builder/components/AttachmentBuilderErrorBoundary';

interface AttachmentBuilderTabProps {
  templates: AttachmentTemplate[];
  onSave?: (templates: AttachmentTemplate[]) => void;
}

const FIELD_LIBRARY = {
  'Job Details': [
    { name: 'Job Number', code: '[JobNumber]' },
    { name: 'Con Note', code: '[ConNote]' },
    { name: 'Date', code: '[Date]' },
    { name: 'Time', code: '[Time]' },
  ],
  'Addresses': [
    { name: 'Pickup Company', code: '[PickupCompany]' },
    { name: 'Delivery Company', code: '[DeliveryCompany]' },
  ],
};

function AttachmentBuilderTabInner({ templates, onSave }: AttachmentBuilderTabProps) {
  const [state, dispatch] = useReducer(editorReducer, templates, (seed) => createInitialEditorState(seed));
  const [fieldCounter, setFieldCounter] = useState(1000);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedTemplate = useMemo(
    () => state.templates.find(t => t.id === state.interaction.selectedTemplateId) ?? null,
    [state.templates, state.interaction.selectedTemplateId]
  );
  const selectedField = selectedTemplate?.fields.find(f => f.id === state.interaction.selectedFieldId) ?? null;

  const filteredLibrary = useMemo(() => Object.entries(FIELD_LIBRARY).reduce((acc, [category, fields]) => {
    const filtered = fields.filter(f => f.name.toLowerCase().includes(state.interaction.fieldSearch.toLowerCase()));
    if (filtered.length) acc[category] = filtered;
    return acc;
  }, {} as Record<string, typeof FIELD_LIBRARY[keyof typeof FIELD_LIBRARY]>), [state.interaction.fieldSearch]);

  const updateField = useCallback((fieldId: string, updates: Partial<AttachmentField>) => {
    if (!selectedTemplate) return;
    dispatch({ type: 'update-field', templateId: selectedTemplate.id, fieldId, updates });
  }, [selectedTemplate]);

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !canvasRef.current) return;

    const fieldCode = e.dataTransfer.getData('fieldCode');
    const fieldName = e.dataTransfer.getData('fieldName');
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = state.interaction.zoom / 100;

    const newField: AttachmentField = {
      id: `field-${fieldCounter}`,
      label: fieldName,
      mergeField: fieldCode,
      x: Math.max(0, Math.round((e.clientX - rect.left) / scale) - 100),
      y: Math.max(0, Math.round((e.clientY - rect.top) / scale) - 20),
      width: 200,
      height: 40,
      fontSize: 14,
      fontFamily: 'Arial',
      fontColor: '#0d0c2c',
      alignment: 'left',
      isBold: false,
      isItalic: false,
    };

    setFieldCounter(v => v + 1);
    dispatch({ type: 'add-field', templateId: selectedTemplate.id, field: newField });
    dispatch({ type: 'select-field', fieldId: newField.id });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!selectedTemplate || !state.interaction.selectedFieldId) return;
    const drag = state.interaction.drag;
    if (!drag.isDragging && !drag.isResizing) return;

    const scale = state.interaction.zoom / 100;
    const dx = (e.clientX - drag.startX) / scale;
    const dy = (e.clientY - drag.startY) / scale;

    if (drag.isDragging) {
      updateField(state.interaction.selectedFieldId, { x: Math.max(0, Math.round(drag.startLeft + dx)), y: Math.max(0, Math.round(drag.startTop + dy)) });
    }
  }, [selectedTemplate, state.interaction, updateField]);

  useEffect(() => {
    if (state.interaction.drag.isDragging || state.interaction.drag.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', () => dispatch({ type: 'set-drag', payload: { isDragging: false, isResizing: false, resizeDirection: null } }));
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [handleMouseMove, state.interaction.drag.isDragging, state.interaction.drag.isResizing]);

  useAutosave({
    templates: state.templates,
    saveStatus: state.saveStatus,
    onSavingState: () => dispatch({ type: 'set-save-status', status: 'saving' }),
    onSaved: () => {
      dispatch({ type: 'mark-saved', at: new Date().toISOString() });
      onSave?.(state.templates);
    },
    onError: (message) => dispatch({ type: 'set-save-status', status: 'error', error: message }),
    onPersist: async (nextTemplates) => {
      const version = Math.max(...nextTemplates.map(t => t.version));
      await saveDraft({ templates: nextTemplates, version });
    },
  });

  const publishResult = canPublish(state.templates);
  const handlePublish = async () => {
    if (!publishResult.ok) return;
    try {
      dispatch({ type: 'set-save-status', status: 'saving' });
      const version = Math.max(...state.templates.map(t => t.version));
      await publishTemplates({ templates: state.templates, version });
      dispatch({ type: 'mark-saved', at: new Date().toISOString() });
    } catch (error) {
      if (error instanceof VersionConflictError) {
        dispatch({ type: 'set-save-status', status: 'conflict', error: `Conflict: server version ${error.serverVersion}` });
        return;
      }
      dispatch({ type: 'set-save-status', status: 'error', error: error instanceof Error ? error.message : 'Publish failed' });
    }
  };

  return <div className="space-y-4">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Attachment Builder</h3>
        <p className="text-xs text-text-muted">Save status: {state.saveStatus}{state.error ? ` — ${state.error}` : ''}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => dispatch({ type: 'set-zoom', value: Math.max(50, state.interaction.zoom - 25) })}>-</Button>
        <span className="text-sm w-12 text-center">{state.interaction.zoom}%</span>
        <Button variant="secondary" size="sm" onClick={() => dispatch({ type: 'set-zoom', value: Math.min(150, state.interaction.zoom + 25) })}>+</Button>
        <Button variant="primary" size="sm" onClick={handlePublish} disabled={!publishResult.ok}>Publish</Button>
      </div>
    </div>

    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-2 bg-white border border-border rounded-lg divide-y divide-border">
        {state.templates.map(template => (
          <button key={template.id} className={`w-full text-left p-3 ${selectedTemplate?.id === template.id ? 'bg-brand-cyan/10' : ''}`} onClick={() => dispatch({ type: 'select-template', templateId: template.id })}>
            <div className="text-sm font-medium">{template.name}</div>
            <div className="text-xs text-text-muted">v{template.version} · {template.fields.length} fields</div>
          </button>
        ))}
      </div>

      <div className="col-span-7 bg-white border border-border rounded-lg p-4 overflow-auto">
        {selectedTemplate && <div ref={canvasRef} className="relative bg-white border border-dashed border-border" style={{ width: selectedTemplate.width, height: selectedTemplate.height, transform: `scale(${state.interaction.zoom / 100})`, transformOrigin: 'top left' }} onDragOver={(e) => e.preventDefault()} onDrop={handleCanvasDrop}>
          {selectedTemplate.fields.map((field) => <div key={field.id} className={`absolute cursor-move border ${state.interaction.selectedFieldId === field.id ? 'border-brand-cyan' : 'border-border'}`} style={{ left: field.x, top: field.y, width: field.width, height: field.height }} onMouseDown={(e) => {
            dispatch({ type: 'select-field', fieldId: field.id });
            dispatch({ type: 'set-drag', payload: { isDragging: true, startX: e.clientX, startY: e.clientY, startLeft: field.x, startTop: field.y } });
          }}>
            <div className="text-xs p-1 truncate">{field.mergeField}</div>
          </div>)}
        </div>}
      </div>

      <div className="col-span-3 space-y-3">
        <div className="bg-white border border-border rounded-lg p-3">
          <input type="text" placeholder="Search fields" className="w-full border border-border rounded px-2 py-1 text-sm" value={state.interaction.fieldSearch} onChange={(e) => dispatch({ type: 'set-field-search', value: e.target.value })} />
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {Object.entries(filteredLibrary).map(([category, fields]) => <div key={category}>
              <button className="text-xs font-semibold" onClick={() => dispatch({ type: 'toggle-category', category })}>{category}</button>
              {state.interaction.expandedCategories[category] && fields.map(field => <div key={field.code} draggable onDragStart={(e) => { e.dataTransfer.setData('fieldCode', field.code); e.dataTransfer.setData('fieldName', field.name); }} className="mt-1 p-1 bg-surface-light text-xs rounded">{field.name}</div>)}
            </div>)}
          </div>
        </div>

        {selectedField && <div className="bg-white border border-border rounded-lg p-3 space-y-2">
          <div className="text-sm font-medium">Field Properties</div>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={selectedField.x} onChange={(e) => updateField(selectedField.id, { x: parseInt(e.target.value) || 0 })} className="border rounded px-2 py-1 text-sm" />
            <input type="number" value={selectedField.y} onChange={(e) => updateField(selectedField.id, { y: parseInt(e.target.value) || 0 })} className="border rounded px-2 py-1 text-sm" />
          </div>
          <Toggle checked={selectedField.isBold} onChange={(checked) => updateField(selectedField.id, { isBold: checked })} label="Bold" />
          <Button variant="danger" size="sm" onClick={() => selectedTemplate && dispatch({ type: 'delete-field', templateId: selectedTemplate.id, fieldId: selectedField.id })}>Delete field</Button>
        </div>}
      </div>
    </div>
    {!publishResult.ok && <div className="text-xs text-red-600">Publish blocked: {publishResult.issues.filter(x => x.severity === 'error').map(x => x.message).join(', ')}</div>}
    <div className="text-xs text-text-muted">Autosave and draft versioning enabled with conflict detection.</div>
  </div>;
}

export function AttachmentBuilderTab(props: AttachmentBuilderTabProps) {
  return <AttachmentBuilderErrorBoundary><AttachmentBuilderTabInner {...props} /></AttachmentBuilderErrorBoundary>;
}
