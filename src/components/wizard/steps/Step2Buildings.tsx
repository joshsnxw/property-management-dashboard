"use client";

import { Button } from "@/components/ui/Button";

export interface BuildingData {
  label:       string;
  street:      string;
  houseNumber: string;
  postalCode:  string;
  city:        string;
  yearBuilt?:  number;
  floors?:     number;
}

interface Props {
  buildings:  BuildingData[];
  onChange:   (buildings: BuildingData[]) => void;
  errors:     Record<string, string>;
  showErrors?: boolean;
}

const emptyBuilding: BuildingData = {
  label: "", street: "", houseNumber: "", postalCode: "", city: "",
};

export function Step2Buildings({ buildings, onChange, errors, showErrors }: Props) {
  function update(i: number, patch: Partial<BuildingData>) {
    const next = buildings.map((b, idx) => (idx === i ? { ...b, ...patch } : b));
    onChange(next);
  }

  function add() {
    onChange([...buildings, { ...emptyBuilding }]);
  }

  function remove(i: number) {
    if (buildings.length === 1) return;
    onChange(buildings.filter((_, idx) => idx !== i));
  }

  const base = "w-full px-3 py-1.5 text-sm rounded-md border bg-bg-0 text-primary placeholder:text-tertiary focus:outline-none transition-colors";
  const ok   = "border-border focus:border-accent";
  const bad  = "border-red focus:border-red";

  function ic(value: string) { return `${base} ${showErrors && !value.trim() ? bad : ok}`; }

  const req = <span className="text-red ml-0.5">*</span>;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-primary">Buildings</h2>

      {buildings.map((b, i) => (
        <div key={i} className="border border-border rounded-md p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              Building {i + 1}
            </span>
            {buildings.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-xs text-red hover:underline"
              >
                Remove
              </button>
            )}
          </div>

          {/* Label */}
          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Label{req}</label>
            <input
              autoComplete="off"
              placeholder="Label"
              className={ic(b.label)}
              value={b.label}
              onChange={(e) => update(i, { label: e.target.value })}
            />
          </div>

          {/* Street + Number */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-secondary mb-1">Street{req}</label>
              <input
                autoComplete="off"
                placeholder="Street"
                className={ic(b.street)}
                value={b.street}
                onChange={(e) => update(i, { street: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">No.{req}</label>
              <input
                autoComplete="off"
                placeholder="No."
                className={ic(b.houseNumber)}
                value={b.houseNumber}
                onChange={(e) => update(i, { houseNumber: e.target.value })}
              />
            </div>
          </div>

          {/* Postal + City */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Postal code{req}</label>
              <input
                autoComplete="off"
                placeholder="Postal code"
                className={ic(b.postalCode)}
                value={b.postalCode}
                onChange={(e) => update(i, { postalCode: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">City{req}</label>
              <input
                autoComplete="off"
                placeholder="City"
                className={ic(b.city)}
                value={b.city}
                onChange={(e) => update(i, { city: e.target.value })}
              />
            </div>
          </div>

          {/* Year + Floors */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Year built</label>
              <input
                type="number"
                autoComplete="off"
                placeholder="Year built"
                className={`${base} ${ok}`}
                value={b.yearBuilt ?? ""}
                onChange={(e) =>
                  update(i, { yearBuilt: e.target.value ? parseInt(e.target.value) : undefined })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Floors</label>
              <input
                type="number"
                autoComplete="off"
                placeholder="Floors"
                className={`${base} ${ok}`}
                value={b.floors ?? ""}
                onChange={(e) =>
                  update(i, { floors: e.target.value ? parseInt(e.target.value) : undefined })
                }
              />
            </div>
          </div>
        </div>
      ))}

      <Button variant="ghost" size="sm" onClick={add} className="self-start">
        + Add building
      </Button>
    </div>
  );
}
