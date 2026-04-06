"use client";

import { useState } from "react";
import { BuildingData } from "./Step2Buildings";
import { UnitRow } from "./Step3Units";

interface Props {
  open:      boolean;
  buildings: BuildingData[];
  onConfirm: (units: UnitRow[]) => void;
  onCancel:  () => void;
}

type Format = "numeric" | "prefixed";
const UNIT_TYPES = ["APARTMENT", "OFFICE", "GARDEN", "PARKING"] as const;

function generateNumbers(count: number, start: string, format: Format, prefix: string): string[] {
  const base = parseInt(start, 10);
  return Array.from({ length: count }, (_, i) => {
    const n = isNaN(base) ? (i === 0 ? start : `${start}${i + 1}`) : String(base + i);
    return format === "prefixed" ? `${prefix}${n}` : n;
  });
}

export function BulkAddDialog({ open, buildings, onConfirm, onCancel }: Props) {
  const [count, setCount]               = useState(10);
  const [start, setStart]               = useState("101");
  const [format, setFormat]             = useState<Format>("numeric");
  const [prefix, setPrefix]             = useState("");
  const [type, setType]                 = useState<UnitRow["type"]>("APARTMENT");
  const [buildingIndex, setBuildingIndex] = useState(0);
  const [floor, setFloor]               = useState("");
  const [entrance, setEntrance]         = useState("");

  if (!open) return null;

  const preview = generateNumbers(Math.min(count, 3), start, format, prefix);
  const previewLabel = count > 3
    ? `${preview.join(", ")}, … (${count} total)`
    : preview.join(", ");

  function handleConfirm() {
    const numbers = generateNumbers(count, start, format, prefix);
    const rows: UnitRow[] = numbers.map((number) => ({
      number,
      type,
      buildingIndex,
      floor,
      entrance,
      sizeSqm:          "",
      coOwnershipShare: "",
      yearBuilt:        "",
      rooms:            "",
    }));
    onConfirm(rows);
  }

  const inputClass = "w-full px-3 py-2 text-sm rounded-md border border-border bg-bg-0 text-primary placeholder:text-tertiary focus:outline-none focus:border-accent transition-colors";
  const labelClass = "block text-xs font-medium text-secondary mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-bg-0 border border-border rounded-lg shadow-lg p-6 w-full max-w-md mx-4 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-primary">Add multiple units</h2>

        {/* Count + start */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Number of units</label>
            <input
              type="number"
              min={1} max={200}
              className={inputClass}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
            />
          </div>
          <div>
            <label className={labelClass}>Starting number</label>
            <input
              autoComplete="off"
              className={inputClass}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              placeholder="101"
            />
          </div>
        </div>

        {/* Format */}
        <div>
          <label className={labelClass}>Numbering format</label>
          <div className="flex gap-2">
            {(["numeric", "prefixed"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${
                  format === f
                    ? "border-accent bg-accent-dim text-accent"
                    : "border-border bg-bg-0 text-secondary hover:border-border-med"
                }`}
              >
                {f === "numeric" ? "Numeric (101, 102…)" : "Prefixed (A-01, B-01…)"}
              </button>
            ))}
          </div>
          {format === "prefixed" && (
            <input
              autoComplete="off"
              className={`${inputClass} mt-2`}
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="Prefix, e.g. A-"
            />
          )}
        </div>

        {/* Type + Building */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Unit type</label>
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as UnitRow["type"])}>
              {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Building</label>
            <select className={inputClass} value={buildingIndex} onChange={(e) => setBuildingIndex(parseInt(e.target.value))}>
              {buildings.map((b, i) => (
                <option key={i} value={i}>{b.label || `Building ${i + 1}`}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Floor + Entrance */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Floor <span className="text-tertiary font-normal">(optional)</span></label>
            <input autoComplete="off" className={inputClass} value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="e.g. EG, 1, 2" />
          </div>
          <div>
            <label className={labelClass}>Entrance <span className="text-tertiary font-normal">(optional)</span></label>
            <input autoComplete="off" className={inputClass} value={entrance} onChange={(e) => setEntrance(e.target.value)} placeholder="e.g. A, B" />
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-md bg-bg-1 border border-border px-3 py-2 text-xs text-secondary">
          Preview: <span className="text-primary font-medium">{previewLabel || "—"}</span>
        </div>

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
            onClick={handleConfirm}
            className="px-3 py-1.5 text-xs rounded-md bg-accent text-white hover:bg-accent/90 transition-colors"
          >
            Add {count} units
          </button>
        </div>
      </div>
    </div>
  );
}
