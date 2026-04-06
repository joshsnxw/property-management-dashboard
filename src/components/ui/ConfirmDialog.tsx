"use client";

import { Modal } from "./Modal";

interface Props {
  open:          boolean;
  title:         string;
  message:       string;
  confirmLabel?: string;
  onConfirm:     () => void;
  onCancel:      () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} onClose={onCancel} maxWidth="sm">
      <h2 className="text-sm font-semibold text-primary">{title}</h2>
      <p className="text-sm text-secondary">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs rounded-md border border-border text-secondary hover:text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-3 py-1.5 text-xs rounded-md bg-red/10 text-red border border-red/20 hover:bg-red/20 transition-colors"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
