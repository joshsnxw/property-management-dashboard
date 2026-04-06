"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Step1GeneralInfo, Step1Data, UploadedDoc, Contact } from "./steps/Step1GeneralInfo";
import { Step2Buildings, BuildingData } from "./steps/Step2Buildings";
import { Step3Units, UnitRow } from "./steps/Step3Units";
import { PrefillDialog, ExtractedProperty } from "@/components/ui/PrefillDialog";

const STEPS = ["General info", "Buildings", "Units"];

const emptyStep1: Step1Data = {
  type: null,
  name: "",
  number: "",
  managerId: "",
  accountantId: "",
};

const emptyBuilding: BuildingData = {
  label: "",
  street: "",
  houseNumber: "",
  postalCode: "",
  city: "Berlin",
  yearBuilt: undefined,
  floors: undefined,
};

export function WizardShell() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep]           = useState(0);
  const [step1, setStep1]         = useState<Step1Data>(emptyStep1);
  const [buildings, setBuildings] = useState<BuildingData[]>([{ ...emptyBuilding }]);
  const [units, setUnits]         = useState<UnitRow[]>([]);
  const [saving, setSaving]           = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [showErrors, setShowErrors]   = useState(false);
  const [pendingPrefill, setPendingPrefill] = useState<ExtractedProperty | null>(null);
  const [uploadedDocs, setUploadedDocs]     = useState<UploadedDoc[]>([]);
  const [contacts, setContacts]             = useState<Contact[]>([]);
  const [applying, setApplying]             = useState(false);

  useEffect(() => {
    fetch("/api/contacts").then((r) => r.json()).then(setContacts).catch(() => {});
  }, []);

  async function applyPrefill(extracted: ExtractedProperty) {
    if (extracted.name) setStep1((prev) => ({ ...prev, name: extracted.name! }));
    if (extracted.type === "WEG" || extracted.type === "MV") {
      setStep1((prev) => ({ ...prev, type: extracted.type as "WEG" | "MV" }));
    }
    if (extracted.buildings.length > 0) {
      setBuildings(extracted.buildings.map((b) => ({
        label:       b.label ?? "",
        street:      (b as any).street      ?? "",
        houseNumber: (b as any).houseNumber ?? "",
        postalCode:  (b as any).postalCode  ?? "",
        city:        (b as any).city        ?? "",
        yearBuilt:   (b as any).yearBuilt   ?? undefined,
        floors:      (b as any).floors      ?? undefined,
      })));
      setUnits(
        extracted.buildings.flatMap((b, bi) =>
          (b.units ?? []).map((u) => ({
            number:           u.number           ?? "",
            type:             (["APARTMENT","OFFICE","GARDEN","PARKING"].includes(u.type) ? u.type : "APARTMENT") as UnitRow["type"],
            floor:            (u as any).floor            ?? "",
            entrance:         (u as any).entrance         ?? "",
            sizeSqm:          (u as any).sizeSqm != null   ? String((u as any).sizeSqm)  : "",
            coOwnershipShare: (u as any).coOwnershipShare ?? "",
            yearBuilt:        (u as any).yearBuilt != null ? String((u as any).yearBuilt) : "",
            rooms:            (u as any).rooms != null     ? String((u as any).rooms)     : "",
            buildingIndex:    bi,
          }))
        )
      );
    }

    // Resolve manager and accountant contacts (match existing or create new)
    for (const [nameKey, role, idKey, prefix] of [
      ["managerName",    "MANAGER",    "managerId",    "manager"]    as const,
      ["accountantName", "ACCOUNTANT", "accountantId", "accountant"] as const,
    ]) {
      const name = (extracted as any)[nameKey] as string | undefined;
      if (!name) continue;
      try {
        const res = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            role,
            street:      (extracted as any)[`${prefix}Street`]      ?? null,
            houseNumber: (extracted as any)[`${prefix}HouseNumber`] ?? null,
            postalCode:  (extracted as any)[`${prefix}PostalCode`]  ?? null,
            city:        (extracted as any)[`${prefix}City`]        ?? null,
          }),
        });
        if (!res.ok) continue;
        const contact: Contact = await res.json();
        setContacts((prev) => prev.some((c) => c.id === contact.id) ? prev : [...prev, contact]);
        setStep1((prev) => ({ ...prev, [idKey]: contact.id }));
      } catch {
        // Non-fatal: dropdown stays unset
      }
    }

    setPendingPrefill(null);
    toast("Fields prefilled from document", "success");
  }

  function validateStep1(): boolean {
    const e: Record<string, string> = {};
    if (!step1.type)         e.type        = "Select a property type";
    if (!step1.name.trim())  e.name        = "Name is required";
    if (!step1.managerId)    e.managerId   = "Select a manager";
    if (!step1.accountantId) e.accountantId= "Select an accountant";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2(): boolean {
    const e: Record<string, string> = {};
    buildings.forEach((b, i) => {
      if (!b.label.trim())       e[`b${i}_label`]       = "Required";
      if (!b.street.trim())      e[`b${i}_street`]      = "Required";
      if (!b.houseNumber.trim()) e[`b${i}_houseNumber`] = "Required";
      if (!b.postalCode.trim())  e[`b${i}_postalCode`]  = "Required";
      if (!b.city.trim())        e[`b${i}_city`]        = "Required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleContinue() {
    if (step === 0 && !validateStep1()) { setShowErrors(true); toast("Please fill in all mandatory fields", "error"); return; }
    if (step === 1 && !validateStep2()) { setShowErrors(true); toast("Please fill in all mandatory fields", "error"); return; }
    if (step < 2) { setErrors({}); setShowErrors(false); setStep(step + 1); }
  }

  function validateStep3(): boolean {
    const e: Record<string, string> = {};
    units.forEach((u, i) => {
      if (!u.number.trim()) e[`u${i}_number`] = "Required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (units.length === 0) { toast("Add at least one unit before saving", "error"); return; }
    if (!validateStep3()) { setShowErrors(true); toast("Please fill in all mandatory fields", "error"); return; }
    setSaving(true);
    try {
      const firstBuilding = buildings[0];
      const address = `${firstBuilding.street} ${firstBuilding.houseNumber}, ${firstBuilding.postalCode} ${firstBuilding.city}`;
      const body = {
        name:        step1.name,
        address,
        number:      step1.number || undefined,
        type:        step1.type,
        managerId:   step1.managerId,
        accountantId:step1.accountantId,
        buildings:   buildings.map((b) => ({
          ...b,
          yearBuilt: b.yearBuilt ?? undefined,
          floors:    b.floors ?? undefined,
        })),
        units: units.map((u) => ({
          ...u,
          sizeSqm:          u.sizeSqm          ? parseFloat(u.sizeSqm)    : undefined,
          rooms:            u.rooms            ? parseFloat(u.rooms)      : undefined,
          yearBuilt:        u.yearBuilt        ? parseInt(u.yearBuilt)    : undefined,
          coOwnershipShare: u.coOwnershipShare || undefined,
        })),
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error ?? "Failed to create property", "error");
        return;
      }

      const created = await res.json();

      for (const doc of uploadedDocs) {
        await fetch(`/api/properties/${created.id}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(doc),
        });
      }

      toast("Property created successfully", "success");
      router.push("/properties");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`flex flex-col gap-6 ${step === 2 ? "w-full" : "max-w-2xl"}`}>
      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  i < step
                    ? "bg-accent text-white"
                    : i === step
                    ? "bg-accent text-white"
                    : "bg-bg-3 text-tertiary"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-sm ${i === step ? "text-primary font-medium" : "text-tertiary"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px mx-3 ${i < step ? "bg-accent" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className={`bg-bg-0 border border-border rounded-lg ${step === 2 ? "p-4" : "p-6"}`}>
        {step === 0 && (
          <Step1GeneralInfo
            data={step1}
            onChange={setStep1}
            errors={errors}
            showErrors={showErrors}
            contacts={contacts}
            onParsed={setPendingPrefill}
            onDocumentUploaded={(doc) => setUploadedDocs((prev) => [...prev, doc])}
          />
        )}
        {step === 1 && (
          <Step2Buildings
            buildings={buildings}
            onChange={setBuildings}
            errors={errors}
            showErrors={showErrors}
          />
        )}
        {step === 2 && (
          <Step3Units
            buildings={buildings}
            units={units}
            onChange={setUnits}
            errors={errors}
            showErrors={showErrors}
          />
        )}
      </div>

      <PrefillDialog
        open={pendingPrefill !== null}
        data={pendingPrefill ?? { buildings: [] }}
        applying={applying}
        onApply={() => {
          if (!pendingPrefill) return;
          setApplying(true);
          applyPrefill(pendingPrefill).finally(() => setApplying(false));
        }}
        onCancel={() => setPendingPrefill(null)}
      />

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => (step === 0 ? router.push("/properties") : setStep(step - 1))}
        >
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        {step < 2 ? (
          <Button onClick={handleContinue}>Continue</Button>
        ) : (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save property ✓"}
          </Button>
        )}
      </div>
    </div>
  );
}
