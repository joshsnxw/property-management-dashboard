"use client";

interface Props {
  open:       boolean;
  title:      string;
  message:    string;
  confirmLabel?: string;
  onConfirm:  () => void;
  onCancel:   () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-bg-0 border border-border rounded-lg shadow-lg p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
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
      </div>
    </div>
  );
}
