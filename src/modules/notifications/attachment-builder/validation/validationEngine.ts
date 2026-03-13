import type { AttachmentTemplateV2 } from '../schema/templateSchema';

export interface ValidationIssue {
  templateId: string;
  fieldId?: string;
  severity: 'error' | 'warning';
  message: string;
}

export function validateTemplatesForPublish(templates: AttachmentTemplateV2[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const template of templates) {
    if (!template.name.trim()) {
      issues.push({ templateId: template.id, severity: 'error', message: 'Template name is required' });
    }

    if (template.fields.length === 0) {
      issues.push({ templateId: template.id, severity: 'error', message: 'At least one field is required' });
    }

    for (const field of template.fields) {
      if (field.x < 0 || field.y < 0) {
        issues.push({ templateId: template.id, fieldId: field.id, severity: 'error', message: 'Field must be inside canvas bounds' });
      }
      if (field.width < 50 || field.height < 20) {
        issues.push({ templateId: template.id, fieldId: field.id, severity: 'warning', message: 'Field size is very small' });
      }
      if (!field.mergeField?.trim()) {
        issues.push({ templateId: template.id, fieldId: field.id, severity: 'error', message: 'Field merge token is required' });
      }
    }
  }

  return issues;
}

export function canPublish(templates: AttachmentTemplateV2[]) {
  const issues = validateTemplatesForPublish(templates);
  return {
    issues,
    ok: !issues.some(issue => issue.severity === 'error'),
  };
}
