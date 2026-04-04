"use client";

import { useEffect, useState } from "react";
import { UploadZone } from "@/components/ui/UploadZone";

export interface Step1Data {
  type: "WEG" | "MV" | null;
  name: string;
  number: string;
  managerId: string;
  accountantId: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: "MANAGER" | "ACCOUNTANT";
}

interface Props {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  errors: Record<string, string>;
}

export function Step1GeneralInfo({ data, onChange, errors }: Props) {
  const [staff, setStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    fetch("/api/staff")
      .then((r) => r.json())
      .then(setStaff)
      .catch(() => {});
  }, []);

  const managers    = staff.filter((s) => s.role === "MANAGER");
  const accountants = staff.filter((s) => s.role === "ACCOUNTANT");

  function set(patch: Partial<Step1Data>) {
    onChange({ ...data, ...patch });
  }

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-md border border-border bg-bg-0 text-primary placeholder:text-tertiary focus:outline-none focus:border-accent transition-colors";
  const selectClass = inputClass;
  const labelClass  = "block text-xs font-medium text-secondary mb-1";

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-primary">General information</h2>

      {/* Type selector */}
      <div>
        <p className={labelClass}>Property type</p>
        <div className="flex gap-3">
          {(["WEG", "MV"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set({ type: t })}
              className={`flex-1 py-3 rounded-md border-[1.5px] text-sm font-medium transition-colors ${
                data.type === t
                  ? "border-accent bg-accent-dim text-accent"
                  : "border-border bg-bg-0 text-secondary hover:border-border-med"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {errors.type && <p className="mt-1 text-xs text-red">{errors.type}</p>}
      </div>

      {/* Name */}
      <div>
        <label className={labelClass}>Property name</label>
        <input
          className={inputClass}
          placeholder="e.g. Wohnanlage Prenzlauer Berg"
          value={data.name}
          onChange={(e) => set({ name: e.target.value })}
        />
        {errors.name && <p className="mt-1 text-xs text-red">{errors.name}</p>}
      </div>

      {/* Number */}
      <div>
        <label className={labelClass}>Internal number</label>
        <input
          className={inputClass}
          placeholder={`Auto: ${data.type ?? "WEG"}-XXX`}
          value={data.number}
          onChange={(e) => set({ number: e.target.value })}
        />
      </div>

      {/* Manager + Accountant */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Manager</label>
          <select
            className={selectClass}
            value={data.managerId}
            onChange={(e) => set({ managerId: e.target.value })}
          >
            <option value="">Select manager…</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          {errors.managerId && <p className="mt-1 text-xs text-red">{errors.managerId}</p>}
        </div>
        <div>
          <label className={labelClass}>Accountant</label>
          <select
            className={selectClass}
            value={data.accountantId}
            onChange={(e) => set({ accountantId: e.target.value })}
          >
            <option value="">Select accountant…</option>
            {accountants.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          {errors.accountantId && (
            <p className="mt-1 text-xs text-red">{errors.accountantId}</p>
          )}
        </div>
      </div>

      {/* Upload */}
      <div>
        <p className={labelClass}>Teilungserklärung</p>
        <UploadZone label="Drop Teilungserklärung here or click to upload" />
      </div>
    </div>
  );
}
