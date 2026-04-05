"use client";

interface ExtractedUnit {
  number: string;
  type: string;
}

interface ExtractedBuilding {
  label: string;
  units?: ExtractedUnit[];
}

export interface ExtractedProperty {
  name?:      string;
  address?:   string;
  type?:      string;
  buildings:  ExtractedBuilding[];
}

interface Props {
  open:      boolean;
  data:      ExtractedProperty;
  onApply:   () => void;
  onCancel:  () => void;
  applying:  boolean;
}

export function PrefillDialog({ open, data, onApply, onCancel, applying }: Props) {
  if (!open) return null;

  const totalUnits = data.buildings.reduce((sum, b) => sum + (b.units?.length ?? 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-bg-0 border border-border rounded-lg shadow-lg p-6 w-full max-w-lg mx-4 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-primary">Prefill from Teilungserklärung?</h2>
          <p className="text-xs text-tertiary mt-1">The following data was extracted from the document.</p>
        </div>

        <div className="bg-bg-1 rounded-md p-3 flex flex-col gap-2 text-xs">
          {data.name && (
            <div className="flex justify-between gap-4">
              <span className="text-tertiary shrink-0">Property</span>
              <span className="text-primary font-medium text-right">{data.name}</span>
            </div>
          )}
          {data.address && (
            <div className="flex justify-between gap-4">
              <span className="text-tertiary shrink-0">Address</span>
              <span className="text-primary text-right">{data.address}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-tertiary">Buildings</span>
            <span className="text-primary">{data.buildings.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-tertiary">Units</span>
            <span className="text-primary">{totalUnits}</span>
          </div>
        </div>

        {data.buildings.length > 0 && (
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
            {data.buildings.map((b, i) => (
              <div key={i} className="text-xs border border-border rounded px-2.5 py-1.5">
                <span className="font-medium text-primary">{b.label}</span>
                {b.units && b.units.length > 0 && (
                  <span className="text-tertiary ml-2">{b.units.length} units</span>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-tertiary">
          This will add the extracted buildings and units to this property.
        </p>

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
            onClick={onApply}
            disabled={applying}
            className="px-3 py-1.5 text-xs rounded-md bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {applying ? "Applying…" : "Prefill fields"}
          </button>
        </div>
      </div>
    </div>
  );
}
