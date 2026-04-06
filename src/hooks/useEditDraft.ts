"use client";

import { useState } from "react";

/**
 * Manages the editing/draft/dirty state machine for an inline editable entity.
 *
 * @param source   The current authoritative value (prop or parent state).
 * @param toDraft  Derives the editable draft from the source. Defaults to identity.
 *
 * On startEdit the draft is re-derived from the current source, so stale data
 * is never presented to the user even if the source changed between edits.
 */
export function useEditDraft<TSource, TDraft = TSource>(
  source: TSource,
  toDraft: (v: TSource) => TDraft = (v) => v as unknown as TDraft,
) {
  const [editing, setEditing]       = useState(false);
  const [draft, setDraftState]      = useState<TDraft>(() => toDraft(source));

  const isDirty =
    JSON.stringify(draft) !== JSON.stringify(toDraft(source));

  function startEdit() {
    setDraftState(toDraft(source));
    setEditing(true);
  }

  function cancelEdit() {
    setDraftState(toDraft(source));
    setEditing(false);
  }

  function patch(partial: Partial<TDraft>) {
    setDraftState((d) => ({ ...d, ...partial }));
  }

  return { draft, patch, isDirty, editing, startEdit, cancelEdit };
}
