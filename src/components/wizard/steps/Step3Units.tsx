"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { BuildingData } from "./Step2Buildings";

export interface UnitRow {
  number:          string;
  type:            "APARTMENT" | "OFFICE" | "GARDEN" | "PARKING";
  floor:           string;
  entrance:        string;
  sizeSqm:         string;
  rooms:           string;
  buildingIndex:   number;
}

const UNIT_TYPES = ["APARTMENT", "OFFICE", "GARDEN", "PARKING"] as const;

interface Props {
  buildings: BuildingData[];
  units:     UnitRow[];
  onChange:  (units: UnitRow[]) => void;
  errors?:   Record<string, string>;
}

function emptyUnit(buildingIndex = 0): UnitRow {
  return { number: "", type: "APARTMENT", floor: "", entrance: "", sizeSqm: "", rooms: "", buildingIndex };
}

export function Step3Units({ buildings, units, onChange, errors = {} }: Props) {
  const [typeFilter, setTypeFilter] = [null as string | null, (_: string | null) => {}];
  // eslint-disable-next-line prefer-const
  let activeType: string | null = null;
  const [_activeType, setActiveType] = [activeType, (v: string | null) => { activeType = v; }];
  void _activeType; void setActiveType; void typeFilter; void setTypeFilter;

  const tableRef = useRef<HTMLDivElement>(null);

  function update(i: number, patch: Partial<UnitRow>) {
    onChange(units.map((u, idx) => (idx === i ? { ...u, ...patch } : u)));
  }

  function addUnit() {
    onChange([...units, emptyUnit(0)]);
  }

  function removeUnit(i: number) {
    onChange(units.filter((_, idx) => idx !== i));
  }

  function bulkFillDown() {
    if (units.length < 2) return;
    const first = units[0];
    onChange(
      units.map((u, i) =>
        i === 0 ? u : { ...u, buildingIndex: first.buildingIndex, entrance: first.entrance }
      )
    );
  }

  // Tab key moves to next cell in the same row, then wraps to next row
  function handleKeyDown(e: React.KeyboardEvent, rowIdx: number, colIdx: number, colCount: number) {
    if (e.key === "Tab") {
      e.preventDefault();
      const nextCol = colIdx + 1;
      if (nextCol < colCount) {
        focusCell(rowIdx, nextCol);
      } else {
        focusCell(rowIdx + 1, 0);
      }
    }
  }

  function focusCell(row: number, col: number) {
    const el = tableRef.current?.querySelector<HTMLElement>(
      `[data-row="${row}"][data-col="${col}"]`
    );
    el?.focus();
  }

  const thClass = "text-left px-2 py-2 text-xs font-medium text-tertiary whitespace-nowrap";
  const tdInput =
    "w-full px-2 py-1 text-sm bg-transparent text-primary placeholder:text-tertiary focus:outline-none focus:bg-bg-1 rounded transition-colors";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-primary">Units</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={bulkFillDown}>
            Bulk fill ↓
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
            className="px-2.5 py-1 text-xs rounded-full border border-border text-secondary hover:border-accent hover:text-accent transition-colors"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Spreadsheet */}
      <div ref={tableRef} className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-40" />  {/* Building */}
            <col className="w-24" />  {/* Unit # */}
            <col className="w-32" />  {/* Type */}
            <col className="w-16" />  {/* Floor */}
            <col className="w-20" />  {/* Entrance */}
            <col className="w-20" />  {/* Size m² */}
            <col className="w-16" />  {/* Rooms */}
            <col className="w-8"  />  {/* Delete */}
          </colgroup>
          <thead>
            <tr className="bg-bg-1 border-b border-border">
              <th className={thClass}>Building</th>
              <th className={thClass}>Unit #</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Floor</th>
              <th className={thClass}>Entrance</th>
              <th className={thClass}>Size m²</th>
              <th className={thClass}>Rooms</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {units.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-tertiary text-sm">
                  No units yet. Click &quot;+ Add unit&quot; to start.
                </td>
              </tr>
            ) : (
              units.map((u, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-bg-1">
                  {/* Building select */}
                  <td className="px-1 py-0.5">
                    <select
                      data-row={i} data-col={0}
                      value={u.buildingIndex}
                      onChange={(e) => update(i, { buildingIndex: parseInt(e.target.value) })}
                      onKeyDown={(e) => handleKeyDown(e, i, 0, 7)}
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
                      className={`${tdInput} ${errors[`u${i}_number`] ? "ring-1 ring-red rounded" : ""}`}
                      placeholder="1L"
                      value={u.number}
                      onChange={(e) => update(i, { number: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, i, 1, 7)}
                    />
                    {errors[`u${i}_number`] && (
                      <p className="text-xs text-red mt-0.5 px-2">{errors[`u${i}_number`]}</p>
                    )}
                  </td>
                  {/* Type */}
                  <td className="px-1 py-0.5">
                    <select
                      data-row={i} data-col={2}
                      value={u.type}
                      onChange={(e) => update(i, { type: e.target.value as UnitRow["type"] })}
                      onKeyDown={(e) => handleKeyDown(e, i, 2, 7)}
                      className="w-full px-2 py-1 text-sm bg-transparent text-primary focus:outline-none focus:bg-bg-1 rounded"
                    >
                      {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  {/* Floor */}
                  <td className="px-1 py-0.5">
                    <input
                      data-row={i} data-col={3}
                      className={tdInput}
                      placeholder="1"
                      value={u.floor}
                      onChange={(e) => update(i, { floor: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, i, 3, 7)}
                    />
                  </td>
                  {/* Entrance */}
                  <td className="px-1 py-0.5">
                    <input
                      data-row={i} data-col={4}
                      className={tdInput}
                      placeholder="A"
                      value={u.entrance}
                      onChange={(e) => update(i, { entrance: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, i, 4, 7)}
                    />
                  </td>
                  {/* Size */}
                  <td className="px-1 py-0.5">
                    <input
                      type="number"
                      data-row={i} data-col={5}
                      className={tdInput}
                      placeholder="68"
                      value={u.sizeSqm}
                      onChange={(e) => update(i, { sizeSqm: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, i, 5, 7)}
                    />
                  </td>
                  {/* Rooms */}
                  <td className="px-1 py-0.5">
                    <input
                      type="number"
                      data-row={i} data-col={6}
                      className={tdInput}
                      placeholder="2.5"
                      value={u.rooms}
                      onChange={(e) => update(i, { rooms: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, i, 6, 7)}
                    />
                  </td>
                  {/* Delete */}
                  <td className="px-2 py-0.5">
                    <button
                      type="button"
                      onClick={() => removeUnit(i)}
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
    </div>
  );
}
