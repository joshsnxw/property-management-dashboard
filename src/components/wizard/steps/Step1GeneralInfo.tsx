"use client";

import { useEffect, useRef, useState } from "react";
import { UploadZone } from "@/components/ui/UploadZone";
import { useToast } from "@/components/ui/Toast";
import { ExtractedProperty } from "@/components/ui/PrefillDialog";
import { FormField, fieldInputClass } from "@/components/ui/FormField";

export interface Step1Data {
  type: "WEG" | "MV" | null;
  name: string;
  number: string;
  managerId: string;
  accountantId: string;
}

export interface Contact {
  id:   string;
  name: string;
  role: "MANAGER" | "ACCOUNTANT";
}

export interface UploadedDoc {
  url: string;
  name: string;
  sizeBytes: number;
}

interface Props {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  errors: Record<string, string>;
  showErrors?: boolean;
  contacts: Contact[];
  onParsed?: (data: ExtractedProperty) => void;
  onDocumentUploaded?: (doc: UploadedDoc) => void;
}

export function Step1GeneralInfo({ data, onChange, errors, showErrors, contacts, onParsed, onDocumentUploaded }: Props) {
  const { toast } = useToast();
  const fileInputRef                = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]   = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || file.type !== "application/pdf") {
      toast("Please upload a PDF file", "error");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
      if (!uploadRes.ok) { toast("Upload failed", "error"); return; }
      const { url, name: uploadedName, sizeBytes } = await uploadRes.json();
      onDocumentUploaded?.({ url, name: uploadedName, sizeBytes });

      toast("Analysing document…", "info");
      const parseRes = await fetch("/api/parse-teilungserklaerung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentUrl: url }),
      });
      if (!parseRes.ok) { toast("Could not extract data from document", "error"); return; }
      const extracted = await parseRes.json();
      if (extracted.buildings?.length) {
        onParsed?.(extracted);
      } else {
        toast("No property data found in document", "info");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDocFiles(files: FileList) {
    const file = files[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
      if (!uploadRes.ok) { toast("Upload failed", "error"); return; }
      const { url, name: uploadedName, sizeBytes } = await uploadRes.json();
      onDocumentUploaded?.({ url, name: uploadedName, sizeBytes });
      toast("Document added", "success");
    } catch {
      toast("Network error", "error");
    } finally {
      setUploadingDoc(false);
    }
  }

  const managers    = contacts.filter((c) => c.role === "MANAGER");
  const accountants = contacts.filter((c) => c.role === "ACCOUNTANT");

  function set(patch: Partial<Step1Data>) {
    onChange({ ...data, ...patch });
  }

  const ic = (empty: boolean) => fieldInputClass(showErrors && empty);

  return (
    <div className="flex flex-col gap-5">
      {/* Autofill banner */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-bg-1 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-dim text-accent">
            <SparkleIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-primary">Autofill from declaration of division</p>
            <p className="text-xs text-tertiary">Upload the declaration of division PDF to prefill buildings and units automatically.</p>
          </div>
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 rounded-full border border-accent px-4 py-1.5 text-xs font-medium text-accent hover:bg-accent-dim transition-colors disabled:opacity-50"
        >
          {uploading ? <AnalysingLabel /> : "Upload file"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-tertiary">or fill in manually</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <h2 className="text-sm font-semibold text-primary">General information</h2>

      {/* Type selector */}
      <div>
        <p className="block text-xs font-medium text-secondary mb-1">Property type<span className="text-red ml-0.5">*</span></p>
        <div className={`flex gap-3 rounded-md ${showErrors && !data.type ? "outline outline-1 outline-red" : ""}`}>
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
      </div>

      {/* Name */}
      <FormField label="Property name" required>
        <input
          autoComplete="off"
          className={ic(!data.name.trim())}
          placeholder="Property name"
          value={data.name}
          onChange={(e) => set({ name: e.target.value })}
        />
      </FormField>

      {/* Number */}
      <FormField label="Internal number">
        <input
          autoComplete="off"
          className={ic(false)}
          placeholder="Auto-generated if left empty"
          value={data.number}
          onChange={(e) => set({ number: e.target.value })}
        />
      </FormField>

      {/* Manager + Accountant */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Manager" required>
          <select
            className={ic(!data.managerId)}
            value={data.managerId}
            onChange={(e) => set({ managerId: e.target.value })}
          >
            <option value="">Select manager…</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Accountant" required>
          <select
            className={ic(!data.accountantId)}
            value={data.accountantId}
            onChange={(e) => set({ accountantId: e.target.value })}
          >
            <option value="">Select accountant…</option>
            {accountants.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Manual document upload */}
      <FormField label="Documents">
        <UploadZone
          onFiles={handleDocFiles}
          label={uploadingDoc ? "Uploading" : "Drop documents here or click to upload"}
          analysing={uploadingDoc}
        />
      </FormField>
    </div>
  );
}

function AnalysingLabel() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c + 1) % 4), 400);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      Analysing
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ opacity: i < count ? 1 : 0 }}>.</span>
      ))}
    </>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5l1.2 3.8 3.8 1.2-3.8 1.2L8 11.5l-1.2-3.8L3 6.5l3.8-1.2L8 1.5z"
        fill="currentColor"
      />
      <path
        d="M13 10l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6L13 10z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}
