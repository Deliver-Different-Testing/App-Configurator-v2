import type { AttachmentTemplateV2 } from '../schema/templateSchema';

export interface SaveDraftPayload {
  templates: AttachmentTemplateV2[];
  version: number;
}

export class VersionConflictError extends Error {
  serverVersion: number;

  constructor(serverVersion: number) {
    super('Version conflict detected');
    this.serverVersion = serverVersion;
  }
}

export async function saveDraft(payload: SaveDraftPayload): Promise<{ ok: true; version: number }> {
  await new Promise(resolve => setTimeout(resolve, 150));
  const serverVersion = Number(localStorage.getItem('attachment-builder-version') || '1');
  if (payload.version < serverVersion) {
    throw new VersionConflictError(serverVersion);
  }

  localStorage.setItem('attachment-builder-draft', JSON.stringify(payload.templates));
  localStorage.setItem('attachment-builder-version', String(payload.version + 1));
  return { ok: true, version: payload.version + 1 };
}

export async function publishTemplates(payload: SaveDraftPayload): Promise<{ ok: true; publishedAt: string; version: number }> {
  const result = await saveDraft(payload);
  const publishedAt = new Date().toISOString();
  localStorage.setItem('attachment-builder-published-at', publishedAt);
  return { ok: true, publishedAt, version: result.version };
}
