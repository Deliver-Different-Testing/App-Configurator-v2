import { useEffect, useRef } from 'react';
import type { AttachmentTemplateV2 } from '../schema/templateSchema';
import type { SaveStatus } from '../store/editorStore';

interface UseAutosaveOptions {
  templates: AttachmentTemplateV2[];
  saveStatus: SaveStatus;
  onSavingState: () => void;
  onSaved: () => void;
  onError: (message: string) => void;
  onPersist: (templates: AttachmentTemplateV2[]) => Promise<void>;
  delayMs?: number;
}

export function useAutosave({ templates, saveStatus, onSavingState, onSaved, onError, onPersist, delayMs = 1200 }: UseAutosaveOptions) {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (saveStatus !== 'dirty') return;

    onSavingState();
    timerRef.current = window.setTimeout(async () => {
      try {
        await onPersist(templates);
        onSaved();
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Autosave failed');
      }
    }, delayMs);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [delayMs, onError, onPersist, onSaved, onSavingState, saveStatus, templates]);
}
