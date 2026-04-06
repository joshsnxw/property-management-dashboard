"use client";

import { Button } from "@/components/ui/Button";
import { FormField, fieldInputClass } from "@/components/ui/FormField";

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

  const ic = (empty: boolean) => fieldInputClass(showErrors && empty, "sm");

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
          <FormField label="Label" required>
            <input
              autoComplete="off"
              placeholder="Label"
              className={ic(!b.label.trim())}
              value={b.label}
              onChange={(e) => update(i, { label: e.target.value })}
            />
          </FormField>

          {/* Street + Number */}
          <div className="grid grid-cols-3 gap-2">
            <FormField label="Street" required className="col-span-2">
              <input
                autoComplete="off"
                placeholder="Street"
                className={ic(!b.street.trim())}
                value={b.street}
                onChange={(e) => update(i, { street: e.target.value })}
              />
            </FormField>
            <FormField label="No." required>
              <input
                autoComplete="off"
                placeholder="No."
                className={ic(!b.houseNumber.trim())}
                value={b.houseNumber}
                onChange={(e) => update(i, { houseNumber: e.target.value })}
              />
            </FormField>
          </div>

          {/* Postal + City */}
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Postal code" required>
              <input
                autoComplete="off"
                placeholder="Postal code"
                className={ic(!b.postalCode.trim())}
                value={b.postalCode}
                onChange={(e) => update(i, { postalCode: e.target.value })}
              />
            </FormField>
            <FormField label="City" required>
              <input
                autoComplete="off"
                placeholder="City"
                className={ic(!b.city.trim())}
                value={b.city}
                onChange={(e) => update(i, { city: e.target.value })}
              />
            </FormField>
          </div>

          {/* Year + Floors */}
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Year built">
              <input
                type="number"
                autoComplete="off"
                placeholder="Year built"
                className={ic(false)}
                value={b.yearBuilt ?? ""}
                onChange={(e) =>
                  update(i, { yearBuilt: e.target.value ? parseInt(e.target.value) : undefined })
                }
              />
            </FormField>
            <FormField label="Floors">
              <input
                type="number"
                autoComplete="off"
                placeholder="Floors"
                className={ic(false)}
                value={b.floors ?? ""}
                onChange={(e) =>
                  update(i, { floors: e.target.value ? parseInt(e.target.value) : undefined })
                }
              />
            </FormField>
          </div>
        </div>
      ))}

      <Button variant="ghost" size="sm" onClick={add} className="self-start">
        + Add building
      </Button>
    </div>
  );
}
