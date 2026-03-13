import type { AttachmentField, AttachmentTemplate } from '../../types';

export const ATTACHMENT_SCHEMA_VERSION = 2;

export interface AttachmentTemplateV2 extends AttachmentTemplate {
  schemaVersion: 2;
  updatedAt: string;
  publishedAt?: string;
  version: number;
}

type LegacyTemplate = AttachmentTemplate & Partial<Pick<AttachmentTemplateV2, 'schemaVersion' | 'updatedAt' | 'version'>>;

export function migrateTemplateToV2(template: LegacyTemplate): AttachmentTemplateV2 {
  return {
    ...template,
    schemaVersion: 2,
    updatedAt: template.updatedAt ?? new Date().toISOString(),
    version: template.version ?? 1,
    fields: (template.fields ?? []).map(normalizeField),
  };
}

function normalizeField(field: AttachmentField): AttachmentField {
  return {
    ...field,
    width: Math.max(50, Number.isFinite(field.width) ? field.width : 50),
    height: Math.max(20, Number.isFinite(field.height) ? field.height : 20),
    fontSize: Math.max(8, Number.isFinite(field.fontSize) ? field.fontSize : 14),
    fontColor: field.fontColor || '#000000',
    fontFamily: field.fontFamily || 'Arial',
  };
}

export function validateTemplateV2Runtime(template: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!template || typeof template !== 'object') {
    return { valid: false, errors: ['Template must be an object'] };
  }

  const t = template as Partial<AttachmentTemplateV2>;
  if (t.schemaVersion !== 2) errors.push('schemaVersion must be 2');
  if (!t.id) errors.push('id is required');
  if (!t.name) errors.push('name is required');
  if (!Array.isArray(t.fields)) errors.push('fields must be an array');
  if (typeof t.version !== 'number' || t.version < 1) errors.push('version must be >= 1');
  if (!t.updatedAt) errors.push('updatedAt is required');

  for (const field of t.fields ?? []) {
    if (!field.id) errors.push('field.id is required');
    if (!field.mergeField) errors.push(`field ${field.id} mergeField is required`);
  }

  return { valid: errors.length === 0, errors };
}
