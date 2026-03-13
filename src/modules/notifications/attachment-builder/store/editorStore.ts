import type { AttachmentField } from '../../types';
import type { AttachmentTemplateV2 } from '../schema/templateSchema';
import { migrateTemplateToV2 } from '../schema/templateSchema';

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'conflict';

export interface InteractionState {
  selectedTemplateId: string | null;
  selectedFieldId: string | null;
  drag: {
    isDragging: boolean;
    isResizing: boolean;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    startWidth: number;
    startHeight: number;
    resizeDirection: string | null;
  };
  zoom: number;
  fieldSearch: string;
  expandedCategories: Record<string, boolean>;
}

export interface EditorState {
  templates: AttachmentTemplateV2[];
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  error: string | null;
  interaction: InteractionState;
}

type Action =
  | { type: 'select-template'; templateId: string }
  | { type: 'select-field'; fieldId: string | null }
  | { type: 'set-zoom'; value: number }
  | { type: 'set-field-search'; value: string }
  | { type: 'toggle-category'; category: string }
  | { type: 'set-drag'; payload: Partial<InteractionState['drag']> }
  | { type: 'upsert-template'; template: AttachmentTemplateV2 }
  | { type: 'update-field'; templateId: string; fieldId: string; updates: Partial<AttachmentField> }
  | { type: 'add-field'; templateId: string; field: AttachmentField }
  | { type: 'delete-field'; templateId: string; fieldId: string }
  | { type: 'set-save-status'; status: SaveStatus; error?: string | null }
  | { type: 'mark-saved'; at: string };

export function createInitialEditorState(templates: unknown[]): EditorState {
  const normalized = templates.map(t => migrateTemplateToV2(t as never));
  return {
    templates: normalized,
    saveStatus: 'idle',
    lastSavedAt: null,
    error: null,
    interaction: {
      selectedTemplateId: normalized[0]?.id ?? null,
      selectedFieldId: null,
      zoom: 100,
      fieldSearch: '',
      expandedCategories: { 'Job Details': true },
      drag: {
        isDragging: false,
        isResizing: false,
        startX: 0,
        startY: 0,
        startLeft: 0,
        startTop: 0,
        startWidth: 0,
        startHeight: 0,
        resizeDirection: null,
      },
    },
  };
}

export function editorReducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case 'select-template':
      return { ...state, interaction: { ...state.interaction, selectedTemplateId: action.templateId, selectedFieldId: null } };
    case 'select-field':
      return { ...state, interaction: { ...state.interaction, selectedFieldId: action.fieldId } };
    case 'set-zoom':
      return { ...state, interaction: { ...state.interaction, zoom: action.value } };
    case 'set-field-search':
      return { ...state, interaction: { ...state.interaction, fieldSearch: action.value } };
    case 'toggle-category':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          expandedCategories: {
            ...state.interaction.expandedCategories,
            [action.category]: !state.interaction.expandedCategories[action.category],
          },
        },
      };
    case 'set-drag':
      return { ...state, interaction: { ...state.interaction, drag: { ...state.interaction.drag, ...action.payload } } };
    case 'upsert-template':
      return { ...state, templates: state.templates.map(t => t.id === action.template.id ? action.template : t), saveStatus: 'dirty' };
    case 'add-field':
      return {
        ...state,
        templates: state.templates.map(t => t.id !== action.templateId ? t : { ...t, fields: [...t.fields, action.field], updatedAt: new Date().toISOString() }),
        saveStatus: 'dirty',
      };
    case 'update-field':
      return {
        ...state,
        templates: state.templates.map(t => t.id !== action.templateId ? t : {
          ...t,
          fields: t.fields.map(f => f.id === action.fieldId ? { ...f, ...action.updates } : f),
          updatedAt: new Date().toISOString(),
        }),
        saveStatus: 'dirty',
      };
    case 'delete-field':
      return {
        ...state,
        templates: state.templates.map(t => t.id !== action.templateId ? t : { ...t, fields: t.fields.filter(f => f.id !== action.fieldId), updatedAt: new Date().toISOString() }),
        interaction: { ...state.interaction, selectedFieldId: null },
        saveStatus: 'dirty',
      };
    case 'set-save-status':
      return { ...state, saveStatus: action.status, error: action.error ?? null };
    case 'mark-saved':
      return { ...state, saveStatus: 'saved', lastSavedAt: action.at, error: null };
    default:
      return state;
  }
}
