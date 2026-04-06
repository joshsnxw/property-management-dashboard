"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { BuildingData } from "./Step2Buildings";
import { BulkAddDialog } from "./BulkAddDialog";

export interface UnitRow {
  number:           string;
  type:             "APARTMENT" | "OFFICE" | "GARDEN" | "PARKING";
  floor:            string;
  entrance:         string;
  sizeSqm:          string;
  coOwnershipShare: string;
  yearBuilt:        string;
  rooms:            string;
  buildingIndex:    number;
}

const UNIT_TYPES = ["APARTMENT", "OFFICE", "GARDEN", "PARKING"] as const;

interface Props {
  buildings:   BuildingData[];
  units:       UnitRow[];
  onChange:    (units: UnitRow[]) => void;
  errors?:     Record<string, string>;
  showErrors?: boolean;
}

function emptyUnit(buildingIndex = 0): UnitRow {
  return { number: "", type: "APARTMENT", floor: "", entrance: "", sizeSqm: "", coOwnershipShare: "", yearBuilt: "", rooms: "", buildingIndex };
}

function incrementUnitNumber(num: string): string {
  const match = num.match(/^(.*?)(\d+)$/);
  if (match) {
    const incremented = String(parseInt(match[2], 10) + 1).padStart(match[2].length, "0");
    return match[1] + incremented;
  }
  return num + "2";
}

export function Step3Units({ buildings, units, onChange, errors = {}, showErrors }: Props) {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen]     = useState(false);
  const tableRef                    = useRef<HTMLDivElement>(null);
  const pendingFocusRef             = useRef<{ row: number; col: number } | null>(null);

  // Drain pending focus after any render
  useEffect(() => {
    if (pendingFocusRef.current) {
      const { row, col } = pendingFocusRef.current;
      pendingFocusRef.current = null;
      focusCell(row, col);
    }
  });

  const visibleUnits = typeFilter
    ? units.map((u, i) => ({ u, i })).filter(({ u }) => u.type === typeFilter)
    : units.map((u, i) => ({ u, i }));

  function update(i: number, patch: Partial<UnitRow>) {
    onChange(units.map((u, idx) => (idx === i ? { ...u, ...patch } : u)));
  }

  function addUnit() {
    const lastBuildingIndex = units[units.length - 1]?.buildingIndex ?? 0;
    onChange([...units, emptyUnit(lastBuildingIndex)]);
  }

  function removeUnit(i: number) {
    onChange(units.filter((_, idx) => idx !== i));
  }

  function duplicateUnit(i: number) {
    const copy = { ...units[i], number: incrementUnitNumber(units[i].number) };
    const next = [...units];
    next.splice(i + 1, 0, copy);
    onChange(next);
  }

  const COL_COUNT = 9;

  function handleKeyDown(e: React.KeyboardEvent, rowIdx: number, colIdx: number) {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const nextCol = colIdx + 1;
    if (nextCol < COL_COUNT) {
      focusCell(rowIdx, nextCol);
    } else if (rowIdx < units.length - 1) {
      focusCell(rowIdx + 1, 0);
    } else {
      // Last cell of last row — append a new row and focus it
      pendingFocusRef.current = { row: rowIdx + 1, col: 0 };
      onChange([...units, emptyUnit(units[rowIdx]?.buildingIndex ?? 0)]);
    }
  }

  function focusCell(row: number, col: number) {
    const el = tableRef.current?.querySelector<HTMLElement>(
      `[data-row="${row}"][data-col="${col}"]`
    );
    el?.focus();
  }

  const thClass = "text-left px-2 py-2 text-xs font-medium text-tertiary whitespace-nowrap";
  const tdInput = "w-full px-2 py-1 text-sm bg-transparent text-primary placeholder:text-tertiary focus:outline-none focus:bg-bg-1 rounded transition-colors";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-primary">Units</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setBulkOpen(true)}>
            + Add multiple units
          </Button>
          <Button variant="ghost" size="sm" disabled title="Coming soon">
            Import CSV
          </Button>
        </div>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2 flex-wrap">
        {UNIT_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(typeFilter === t ? null : t)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              typeFilter === t
                ? "border-accent bg-accent-dim text-accent"
                : "border-border text-secondary hover:border-accent hover:text-accent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Spreadsheet */}
      <div ref={tableRef} className="border border-border rounded-lg overflow-x-auto">
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
            <col className="w-14" />  {/* duplicate */}
            <col className="w-8" />   {/* delete */}
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
              <th className={thClass} colSpan={2} />
            </tr>
          </thead>
          <tbody>
            {units.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-center text-tertiary text-sm">
                  No units yet. Click &quot;+ Add unit&quot; or &quot;+ Add multiple units&quot; to start.
                </td>
              </tr>
            ) : (
              visibleUnits.map(({ u, i }) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-bg-1 group">
                  {/* Building */}
                  <td className="px-1 py-0.5">
                    <select
                      data-row={i} data-col={0}
                      value={u.buildingIndex}
                      onChange={(e) => update(i, { buildingIndex: parseInt(e.target.value) })}
                      onKeyDown={(e) => handleKeyDown(e, i, 0)}
                      className="w-full px-2 py-1 text-sm bg-transparent text-primary focus:outline-none focus:bg-bg-1 rounded"
                    >
                      {buildings.map((b, bi) => (
                        <option key={bi} value={bi}>{b.label || `Building ${bi + 1}`}</option>
                      ))}
                    </select>
                  </td>
                  {/* Unit number */}
                  <td className="px-1 py-0.5">
                    <input
                      data-row={i} data-col={1}
                      className={`${tdInput} ${showErrors && !u.number.trim() ? "ring-1 ring-red rounded" : ""}`}
                      value={u.number}
                      onChange={(e) => update(i, { number: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, i, 1)}
                    />
                  </td>
                  {/* Type */}
                  <td className="px-1 py-0.5">
                    <select
                      data-row={i} data-col={2}
                      value={u.type}
                      onChange={(e) => update(i, { type: e.target.value as UnitRow["type"] })}
                      onKeyDown={(e) => handleKeyDown(e, i, 2)}
                      className="w-full px-2 py-1 text-sm bg-transparent text-primary focus:outline-none focus:bg-bg-1 rounded"
                    >
                      {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  {/* Floor */}
                  <td className="px-1 py-0.5">
                    <input data-row={i} data-col={3} className={tdInput}
                      value={u.floor} onChange={(e) => update(i, { floor: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, i, 3)} />
                  </td>
                  {/* Entrance */}
                  <td className="px-1 py-0.5">
                    <input data-row={i} data-col={4} className={tdInput}
                      value={u.entrance} onChange={(e) => update(i, { entrance: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, i, 4)} />
                  </td>
                  {/* Size */}
                  <td className="px-1 py-0.5">
                    <input type="number" data-row={i} data-col={5} className={tdInput}
                      value={u.sizeSqm} onChange={(e) => update(i, { sizeSqm: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, i, 5)} />
                  </td>
                  {/* Co-ownership */}
                  <td className="px-1 py-0.5">
                    <input data-row={i} data-col={6} className={tdInput}
                      value={u.coOwnershipShare} onChange={(e) => update(i, { coOwnershipShare: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, i, 6)} />
                  </td>
                  {/* Built */}
                  <td className="px-1 py-0.5">
                    <input type="number" data-row={i} data-col={7} className={tdInput}
                      value={u.yearBuilt} onChange={(e) => update(i, { yearBuilt: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, i, 7)} />
                  </td>
                  {/* Rooms */}
                  <td className="px-1 py-0.5">
                    <input type="number" data-row={i} data-col={8} className={tdInput}
                      value={u.rooms} onChange={(e) => update(i, { rooms: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, i, 8)} />
                  </td>
                  {/* Duplicate */}
                  <td className="px-1 py-0.5 text-center">
                    <button
                      type="button"
                      onClick={() => duplicateUnit(i)}
                      className="opacity-0 group-hover:opacity-100 text-tertiary hover:text-accent transition-colors"
                      aria-label="Duplicate unit"
                    >
                      <CopyIcon />
                    </button>
                  </td>
                  {/* Delete */}
                  <td className="px-2 py-0.5">
                    <button
                      type="button"
                      onClick={() => removeUnit(i)}
                      className="opacity-0 group-hover:opacity-100 text-tertiary hover:text-red transition-colors text-xs"
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

      <BulkAddDialog
        open={bulkOpen}
        buildings={buildings}
        onConfirm={(rows) => { onChange([...units, ...rows]); setBulkOpen(false); }}
        onCancel={() => setBulkOpen(false)}
      />
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 9H1.5A1.5 1.5 0 010 7.5v-6A1.5 1.5 0 011.5 0h6A1.5 1.5 0 019 1.5V2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
