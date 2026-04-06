"use client";

import { useState } from "react";
import { UploadZone } from "@/components/ui/UploadZone";
import { useToast } from "@/components/ui/Toast";
import { PrefillDialog, ExtractedProperty } from "@/components/ui/PrefillDialog";
import { apiFetch } from "@/lib/client";
import { Document, Building } from "./types";
import { cn, TH_CLASS } from "@/lib/utils";

interface Props {
  propertyId:         string;
  documents:          Document[];
  onDocumentAdded:    (doc: Document) => void;
  onDocumentRemoved:  (id: string) => void;
  onPrefillApplied:   (buildings: Building[]) => void;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TabDocuments({ propertyId, documents, onDocumentAdded, onDocumentRemoved, onPrefillApplied }: Props) {
  const { toast } = useToast();
  const [uploading, setUploading]     = useState(false);
  const [extracted, setExtracted]     = useState<ExtractedProperty | null>(null);
  const [applying, setApplying]       = useState(false);
  const [deletingId, setDeletingId]   = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await apiFetch(`/api/documents/${id}`, { method: "DELETE" }, toast, "Failed to delete document");
    setDeletingId(null);
    if (result === null) return;
    onDocumentRemoved(id);
    toast("Document deleted", "success");
  }

  async function handleFiles(files: FileList) {
    const file = files[0];
    if (!file) return;

    setUploading(true);

    // 1. Upload to Vercel Blob
    const formData = new FormData();
    formData.append("file", file);
    const upload = await apiFetch<{ url: string; name: string; sizeBytes: number }>(
      "/api/upload", { method: "POST", body: formData }, toast, "Upload failed",
    );
    if (!upload) { setUploading(false); return; }

    // 2. Save document record
    const doc = await apiFetch<Document>(
      `/api/properties/${propertyId}/documents`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(upload) },
      toast, "Failed to save document",
    );
    if (!doc) { setUploading(false); return; }
    onDocumentAdded(doc);
    toast("Document uploaded", "success");

    // 3. If PDF, attempt declaration of division extraction
    if (file.type === "application/pdf") {
      toast("Analysing document…", "info");
      const parsed = await apiFetch<ExtractedProperty>(
        "/api/parse-teilungserklaerung",
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentUrl: upload.url }) },
        toast,
      );
      if (parsed?.buildings?.length) setExtracted(parsed);
    }

    setUploading(false);
  }

  async function applyPrefill() {
    if (!extracted) return;
    setApplying(true);

    const createdBuildings: Building[] = [];
    const json = { method: "POST", headers: { "Content-Type": "application/json" } } as const;

    for (const b of extracted.buildings) {
      const building = await apiFetch<Building>(
        `/api/properties/${propertyId}/buildings`,
        { ...json, body: JSON.stringify({
          label:       b.label,
          street:      (b as any).street      ?? "",
          houseNumber: (b as any).houseNumber ?? "",
          postalCode:  (b as any).postalCode  ?? "",
          city:        (b as any).city        ?? "",
          yearBuilt:   (b as any).yearBuilt   ?? null,
          floors:      (b as any).floors      ?? null,
        }) },
        toast,
      );
      if (!building) continue;

      const units: Building["units"] = [];
      for (const u of (b.units ?? [])) {
        const unit = await apiFetch<Building["units"][number]>(
          `/api/properties/${propertyId}/units`,
          { ...json, body: JSON.stringify({
            buildingId:       building.id,
            number:           u.number  ?? "",
            type:             u.type    ?? "APARTMENT",
            floor:            (u as any).floor            ?? null,
            entrance:         (u as any).entrance         ?? null,
            sizeSqm:          (u as any).sizeSqm          ?? null,
            coOwnershipShare: (u as any).coOwnershipShare ?? null,
            yearBuilt:        (u as any).yearBuilt        ?? null,
            rooms:            (u as any).rooms            ?? null,
          }) },
          toast,
        );
        if (unit) units.push(unit);
      }

      createdBuildings.push({ ...building, units });
    }

    setApplying(false);
    onPrefillApplied(createdBuildings);
    toast(`Added ${createdBuildings.length} building(s) from document`, "success");
    setExtracted(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <UploadZone
        onFiles={handleFiles}
        label={uploading ? "Uploading…" : "Drop documents here or click to upload"}
      />

      {documents.length === 0 ? (
        <p className="text-sm text-tertiary text-center py-4">No documents uploaded yet.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-1 border-b border-border">
                <th className={cn(TH_CLASS, "px-4")}>Name</th>
                <th className={cn(TH_CLASS, "px-4")}>Size</th>
                <th className={cn(TH_CLASS, "px-4")}>Uploaded</th>
                  <th className="px-4 py-2.5"></th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-bg-1">
                  <td className="px-4 py-3 text-primary">{doc.name}</td>
                  <td className="px-4 py-3 text-secondary">{formatBytes(doc.sizeBytes)}</td>
                  <td className="px-4 py-3 text-secondary text-xs">
                    {new Date(doc.createdAt).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/api/documents/download?url=${encodeURIComponent(doc.url)}`}
                      className="text-xs text-accent hover:underline"
                    >
                      Download
                    </a>
                  </td>
                  <td className="px-2 py-3 w-8">
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="text-tertiary hover:text-red transition-colors disabled:opacity-40"
                      aria-label="Delete document"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PrefillDialog
        open={extracted !== null}
        data={extracted ?? { buildings: [] }}
        applying={applying}
        onApply={applyPrefill}
        onCancel={() => setExtracted(null)}
      />
    </div>
  );
}
