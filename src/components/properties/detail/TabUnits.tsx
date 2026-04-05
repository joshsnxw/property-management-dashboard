"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Building, Unit } from "./types";

interface Props {
  propertyId: string;
  buildings:  Building[];
  onUpdate:   (buildings: Building[]) => void;
}

type UnitType = "APARTMENT" | "OFFICE" | "GARDEN" | "PARKING";
const UNIT_TYPES: UnitType[] = ["APARTMENT", "OFFICE", "GARDEN", "PARKING"];

export function TabUnits({ propertyId, buildings, onUpdate }: Props) {
  const { toast } = useToast();
  const [typeFilter, setTypeFilter]   = useState<UnitType | "ALL">("ALL");
  const [confirmDelete, setConfirmDelete] = useState<Unit | null>(null);

  const allUnits = buildings.flatMap((b) =>
    b.units.map((u) => ({ ...u, buildingLabel: b.label }))
  );

  const filtered = typeFilter === "ALL"
    ? allUnits
    : allUnits.filter((u) => u.type === typeFilter);

  function replaceUnit(updated: Unit) {
    onUpdate(
      buildings.map((b) => ({
        ...b,
        units: b.units.map((u) => (u.id === updated.id ? updated : u)),
      }))
    );
  }

  function moveUnit(unitId: string, oldBuildingId: string, updated: Unit) {
    onUpdate(
      buildings.map((b) => {
        if (b.id === oldBuildingId) return { ...b, units: b.units.filter((u) => u.id !== unitId) };
        if (b.id === updated.buildingId) return { ...b, units: [...b.units, updated] };
        return b;
      })
    );
  }

  async function saveBuildingId(unit: Unit, newBuildingId: string) {
    if (newBuildingId === unit.buildingId) return;
    try {
      const res = await fetch(`/api/units/${unit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildingId: newBuildingId }),
      });
      if (!res.ok) { toast("Failed to move unit", "error"); return; }
      moveUnit(unit.id, unit.buildingId, await res.json());
    } catch {
      toast("Network error — could not move unit", "error");
    }
  }

  function removeUnitFromState(id: string) {
    onUpdate(
      buildings.map((b) => ({ ...b, units: b.units.filter((u) => u.id !== id) }))
    );
  }

  function addUnitToBuilding(buildingId: string, unit: Unit) {
    onUpdate(
      buildings.map((b) =>
        b.id === buildingId ? { ...b, units: [...b.units, unit] } : b
      )
    );
  }

  async function saveField(unit: Unit, field: keyof Unit, raw: string) {
    let value: string | number | null = raw === "" ? null : raw;
    if (field === "sizeSqm" || field === "rooms") {
      value = raw === "" ? null : parseFloat(raw);
      if (value !== null && isNaN(value as number)) return;
    }
    if (field === "yearBuilt") {
      value = raw === "" ? null : parseInt(raw);
      if (value !== null && isNaN(value as number)) return;
    }

    try {
      const res = await fetch(`/api/units/${unit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) { toast("Failed to save unit", "error"); return; }
      replaceUnit(await res.json());
    } catch {
      toast("Network error — could not save unit", "error");
    }
  }

  async function addUnit() {
    const firstBuilding = buildings[0];
    if (!firstBuilding) return;
    try {
      const res = await fetch(`/api/properties/${propertyId}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: "", type: "APARTMENT", buildingId: firstBuilding.id,
        }),
      });
      if (!res.ok) { toast("Failed to add unit", "error"); return; }
      addUnitToBuilding(firstBuilding.id, await res.json());
    } catch {
      toast("Network error — could not add unit", "error");
    }
  }

  async function deleteUnit(id: string) {
    try {
      const res = await fetch(`/api/units/${id}`, { method: "DELETE" });
      if (!res.ok) { toast("Failed to delete unit", "error"); return; }
      removeUnitFromState(id);
    } catch {
      toast("Network error — could not delete unit", "error");
    }
  }

  const thClass = "text-left px-2 py-2 text-xs font-medium text-tertiary whitespace-nowrap";
  const cellInput = (unit: Unit, field: keyof Unit, placeholder = "") => (
    <input
      defaultValue={unit[field] != null ? String(unit[field]) : ""}
      placeholder={placeholder}
      className="w-full px-2 py-1 text-sm bg-transparent text-primary placeholder:text-tertiary focus:outline-none focus:bg-bg-1 rounded transition-colors"
      onBlur={(e) => saveField(unit, field, e.target.value)}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Type filter pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setTypeFilter("ALL")}
          className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
            typeFilter === "ALL"
              ? "border-accent text-accent bg-accent-dim"
              : "border-border text-secondary hover:border-accent hover:text-accent"
          }`}
        >
          All
        </button>
        {UNIT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              typeFilter === t
                ? "border-accent text-accent bg-accent-dim"
                : "border-border text-secondary hover:border-accent hover:text-accent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Spreadsheet */}
      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-36" />
            <col className="w-20" />
            <col className="w-32" />
            <col className="w-14" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-24" />
            <col className="w-16" />
            <col className="w-14" />
            <col className="w-8" />
          </colgroup>
          <thead>
            <tr className="bg-bg-1 border-b border-border">
              <th className={thClass}>Building</th>
              <th className={thClass}>Unit #</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Floor</th>
              <th className={thClass}>Entrance</th>
              <th className={thClass}>Size m²</th>
              <th className={thClass}>Co-ownership</th>
              <th className={thClass}>Built</th>
              <th className={thClass}>Rooms</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-tertiary text-sm">
                  No units found.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-bg-1">
                  <td className="px-1 py-0.5">
                    {buildings.length > 1 ? (
                      <select
                        value={u.buildingId}
                        onChange={(e) => saveBuildingId(u, e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-transparent text-secondary focus:outline-none focus:bg-bg-1 rounded"
                      >
                        {buildings.map((b) => (
                          <option key={b.id} value={b.id}>{b.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="px-2 text-xs text-tertiary">{u.buildingLabel}</span>
                    )}
                  </td>
                  <td className="px-1 py-0.5">{cellInput(u, "number")}</td>
                  <td className="px-1 py-0.5">
                    <select
                      defaultValue={u.type}
                      className="w-full px-2 py-1 text-sm bg-transparent text-primary focus:outline-none focus:bg-bg-1 rounded"
                      onBlur={(e) => saveField(u, "type", e.target.value)}
                    >
                      {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="px-1 py-0.5">{cellInput(u, "floor")}</td>
                  <td className="px-1 py-0.5">{cellInput(u, "entrance")}</td>
                  <td className="px-1 py-0.5">{cellInput(u, "sizeSqm")}</td>
                  <td className="px-1 py-0.5">{cellInput(u, "coOwnershipShare")}</td>
                  <td className="px-1 py-0.5">{cellInput(u, "yearBuilt")}</td>
                  <td className="px-1 py-0.5">{cellInput(u, "rooms")}</td>
                  <td className="px-2 py-0.5">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(u)}
                      className="text-tertiary hover:text-red transition-colors text-xs"
                      aria-label="Remove unit"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Button variant="ghost" size="sm" onClick={addUnit} className="self-start">
        + Add unit
      </Button>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete unit?"
        message={`Delete unit "${confirmDelete?.number || "unnamed"}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => { if (confirmDelete) { deleteUnit(confirmDelete.id); setConfirmDelete(null); } }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
