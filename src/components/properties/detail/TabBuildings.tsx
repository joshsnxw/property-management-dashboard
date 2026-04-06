"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useEditDraft } from "@/hooks/useEditDraft";
import { apiFetch } from "@/lib/client";
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

// ---

interface BuildingRowProps {
  building:          Building;
  propertyId:        string;
  onSaved:           (updated: Building) => void;
  onRequestRemove:   (b: Building) => void;
}

const inputClass =
  "w-full px-2.5 py-1.5 text-sm rounded-md border border-border bg-bg-0 text-primary placeholder:text-tertiary focus:outline-none focus:border-accent transition-colors";

function BuildingRow({ building, onSaved, onRequestRemove }: BuildingRowProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const { draft, patch, editing, startEdit, cancelEdit } =
    useEditDraft(building, toDraft);

  async function save() {
    setSaving(true);
    const updated = await apiFetch<Building>(
      `/api/buildings/${building.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          yearBuilt: draft.yearBuilt ? parseInt(draft.yearBuilt) : null,
          floors:    draft.floors    ? parseInt(draft.floors)    : null,
        }),
      },
      toast,
      "Failed to save building",
    );
    setSaving(false);
    if (!updated) return;
    onSaved({ ...updated, units: building.units });
    cancelEdit();
    toast("Building saved", "success");
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-bg-1">
        <div>
          <span className="text-sm font-medium text-primary">{building.label}</span>
          <span className="ml-2 text-xs text-tertiary">
            {building.street} {building.houseNumber}, {building.postalCode} {building.city}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-tertiary">{building.units.length} units</span>
          {editing ? (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs text-secondary hover:text-primary"
            >
              Collapse
            </button>
          ) : (
            <button
              type="button"
              onClick={startEdit}
              className="text-xs text-accent hover:underline"
            >
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={() => onRequestRemove(building)}
            className="text-xs text-tertiary hover:text-red transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Inline form */}
      {editing && (
        <div className="px-4 py-4 flex flex-col gap-3 border-t border-border">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block text-xs text-secondary mb-1">Label</label>
              <input className={inputClass} value={draft.label}
                onChange={(e) => patch({ label: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-secondary mb-1">Street</label>
              <input className={inputClass} value={draft.street}
                onChange={(e) => patch({ street: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-secondary mb-1">House No.</label>
              <input className={inputClass} value={draft.houseNumber}
                onChange={(e) => patch({ houseNumber: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-secondary mb-1">Postal code</label>
              <input className={inputClass} value={draft.postalCode}
                onChange={(e) => patch({ postalCode: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-secondary mb-1">City</label>
              <input className={inputClass} value={draft.city}
                onChange={(e) => patch({ city: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-secondary mb-1">Year built</label>
              <input type="number" className={inputClass} value={draft.yearBuilt}
                onChange={(e) => patch({ yearBuilt: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-secondary mb-1">Floors</label>
              <input type="number" className={inputClass} value={draft.floors}
                onChange={(e) => patch({ floors: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---

export function TabBuildings({ propertyId, buildings, onUpdate }: Props) {
  const { toast } = useToast();
  const [confirmRemove, setConfirmRemove] = useState<Building | null>(null);

  async function addBuilding() {
    const b = await apiFetch<Building>(
      `/api/properties/${propertyId}/buildings`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: `Haus ${String.fromCharCode(65 + buildings.length)}`,
          street: "", houseNumber: "", postalCode: "", city: "Berlin",
        }),
      },
      toast,
      "Failed to add building",
    );
    if (!b) return;
    onUpdate([...buildings, b]);
  }

  async function removeBuilding(id: string) {
    if (buildings.length === 1) { toast("A property must have at least one building", "error"); return; }
    const result = await apiFetch(
      `/api/buildings/${id}`,
      { method: "DELETE" },
      toast,
      "Failed to remove building",
    );
    setConfirmRemove(null);
    if (result === null) return;
    onUpdate(buildings.filter((b) => b.id !== id));
    toast("Building removed", "success");
  }

  return (
    <div className="flex flex-col gap-3">
      {buildings.map((b) => (
        <BuildingRow
          key={b.id}
          building={b}
          propertyId={propertyId}
          onSaved={(updated) =>
            onUpdate(buildings.map((x) => (x.id === updated.id ? updated : x)))
          }
          onRequestRemove={setConfirmRemove}
        />
      ))}

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
