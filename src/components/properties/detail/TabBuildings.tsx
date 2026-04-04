"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Building } from "./types";

interface Props {
  propertyId: string;
  buildings:  Building[];
  onUpdate:   (buildings: Building[]) => void;
}

interface BuildingDraft {
  label:       string;
  street:      string;
  houseNumber: string;
  postalCode:  string;
  city:        string;
  yearBuilt:   string;
  floors:      string;
}

function toDraft(b: Building): BuildingDraft {
  return {
    label:       b.label,
    street:      b.street,
    houseNumber: b.houseNumber,
    postalCode:  b.postalCode,
    city:        b.city,
    yearBuilt:   b.yearBuilt ? String(b.yearBuilt) : "",
    floors:      b.floors    ? String(b.floors)    : "",
  };
}

export function TabBuildings({ propertyId, buildings, onUpdate }: Props) {
  const { toast } = useToast();
  const [expanded, setExpanded]         = useState<string | null>(null);
  const [drafts, setDrafts]             = useState<Record<string, BuildingDraft>>({});
  const [saving, setSaving]             = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<Building | null>(null);

  function startEdit(b: Building) {
    setDrafts((d) => ({ ...d, [b.id]: toDraft(b) }));
    setExpanded(b.id);
  }

  function setDraft(id: string, patch: Partial<BuildingDraft>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function saveBuilding(b: Building) {
    const draft = drafts[b.id];
    if (!draft) return;
    setSaving(b.id);
    try {
      const res = await fetch(`/api/buildings/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          yearBuilt: draft.yearBuilt ? parseInt(draft.yearBuilt) : null,
          floors:    draft.floors    ? parseInt(draft.floors)    : null,
        }),
      });
      if (!res.ok) { toast("Failed to save building", "error"); return; }
      const updated: Building = await res.json();
      onUpdate(buildings.map((x) => (x.id === b.id ? { ...updated, units: x.units } : x)));
      setExpanded(null);
      toast("Building saved", "success");
    } finally {
      setSaving(null);
    }
  }

  async function addBuilding() {
    try {
      const res = await fetch(`/api/properties/${propertyId}/buildings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: `Haus ${String.fromCharCode(65 + buildings.length)}`,
          street: "", houseNumber: "", postalCode: "", city: "Berlin",
        }),
      });
      if (!res.ok) { toast("Failed to add building", "error"); return; }
      const b: Building = await res.json();
      onUpdate([...buildings, b]);
      startEdit(b);
    } catch {
      toast("Network error — could not add building", "error");
    }
  }

  async function removeBuilding(id: string) {
    if (buildings.length === 1) { toast("A property must have at least one building", "error"); return; }
    try {
      const res = await fetch(`/api/buildings/${id}`, { method: "DELETE" });
      if (!res.ok) { toast("Failed to remove building", "error"); return; }
      onUpdate(buildings.filter((b) => b.id !== id));
      toast("Building removed", "success");
    } catch {
      toast("Network error — could not remove building", "error");
    } finally {
      setConfirmRemove(null);
    }
  }

  const inputClass =
    "w-full px-2.5 py-1.5 text-sm rounded-md border border-border bg-bg-0 text-primary placeholder:text-tertiary focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="flex flex-col gap-3">
      {buildings.map((b) => {
        const isOpen  = expanded === b.id;
        const draft   = drafts[b.id] ?? toDraft(b);
        const isSaving= saving === b.id;

        return (
          <div key={b.id} className="border border-border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-bg-1">
              <div>
                <span className="text-sm font-medium text-primary">{b.label}</span>
                <span className="ml-2 text-xs text-tertiary">
                  {b.street} {b.houseNumber}, {b.postalCode} {b.city}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-tertiary">{b.units.length} units</span>
                {isOpen ? (
                  <button
                    type="button"
                    onClick={() => setExpanded(null)}
                    className="text-xs text-secondary hover:text-primary"
                  >
                    Collapse
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(b)}
                    className="text-xs text-accent hover:underline"
                  >
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setConfirmRemove(b)}
                  className="text-xs text-tertiary hover:text-red transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Inline form */}
            {isOpen && (
              <div className="px-4 py-4 flex flex-col gap-3 border-t border-border">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs text-secondary mb-1">Label</label>
                    <input className={inputClass} value={draft.label}
                      onChange={(e) => setDraft(b.id, { label: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-secondary mb-1">Street</label>
                    <input className={inputClass} value={draft.street}
                      onChange={(e) => setDraft(b.id, { street: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-secondary mb-1">House No.</label>
                    <input className={inputClass} value={draft.houseNumber}
                      onChange={(e) => setDraft(b.id, { houseNumber: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-secondary mb-1">Postal code</label>
                    <input className={inputClass} value={draft.postalCode}
                      onChange={(e) => setDraft(b.id, { postalCode: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-secondary mb-1">City</label>
                    <input className={inputClass} value={draft.city}
                      onChange={(e) => setDraft(b.id, { city: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-secondary mb-1">Year built</label>
                    <input type="number" className={inputClass} value={draft.yearBuilt}
                      onChange={(e) => setDraft(b.id, { yearBuilt: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-secondary mb-1">Floors</label>
                    <input type="number" className={inputClass} value={draft.floors}
                      onChange={(e) => setDraft(b.id, { floors: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="ghost" size="sm" onClick={() => setExpanded(null)}>Cancel</Button>
                  <Button size="sm" onClick={() => saveBuilding(b)} disabled={isSaving}>
                    {isSaving ? "Saving…" : "Save"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Button variant="ghost" size="sm" onClick={addBuilding} className="self-start">
        + Add building
      </Button>

      <ConfirmDialog
        open={confirmRemove !== null}
        title="Remove building?"
        message={`Remove "${confirmRemove?.label}"? All units inside it will also be deleted.`}
        confirmLabel="Remove"
        onConfirm={() => confirmRemove && removeBuilding(confirmRemove.id)}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}
