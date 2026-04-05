"use client";

import { useState } from "react";
import { UploadZone } from "@/components/ui/UploadZone";
import { useToast } from "@/components/ui/Toast";
import { PrefillDialog, ExtractedProperty } from "@/components/ui/PrefillDialog";
import { Document, Building } from "./types";

interface Props {
  propertyId:       string;
  documents:        Document[];
  onDocumentAdded:  (doc: Document) => void;
  onPrefillApplied: (buildings: Building[]) => void;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TabDocuments({ propertyId, documents, onDocumentAdded, onPrefillApplied }: Props) {
  const { toast } = useToast();
  const [uploading, setUploading]     = useState(false);
  const [extracted, setExtracted]     = useState<ExtractedProperty | null>(null);
  const [applying, setApplying]       = useState(false);

  async function handleFiles(files: FileList) {
    const file = files[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload to Vercel Blob
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
      if (!uploadRes.ok) { toast("Upload failed", "error"); return; }
      const { url, name, sizeBytes } = await uploadRes.json();

      // 2. Save document record
      const docRes = await fetch(`/api/properties/${propertyId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, sizeBytes }),
      });
      if (!docRes.ok) { toast("Failed to save document", "error"); return; }
      onDocumentAdded(await docRes.json());
      toast("Document uploaded", "success");

      // 3. If PDF, attempt Teilungserklärung extraction
      if (file.type === "application/pdf") {
        toast("Analysing document…", "info");
        const parseRes = await fetch("/api/parse-teilungserklaerung", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentUrl: url }),
        });
        if (parseRes.ok) {
          const data = await parseRes.json();
          if (data.buildings?.length) setExtracted(data);
        }
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setUploading(false);
    }
  }

  async function applyPrefill() {
    if (!extracted) return;
    setApplying(true);
    try {
      const createdBuildings: Building[] = [];

      for (const b of extracted.buildings) {
        // Create building
        const bRes = await fetch(`/api/properties/${propertyId}/buildings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label:       b.label,
            street:      (b as any).street      ?? "",
            houseNumber: (b as any).houseNumber ?? "",
            postalCode:  (b as any).postalCode  ?? "",
            city:        (b as any).city        ?? "",
            yearBuilt:   (b as any).yearBuilt   ?? null,
            floors:      (b as any).floors      ?? null,
          }),
        });
        if (!bRes.ok) continue;
        const building: Building = await bRes.json();

        // Create units for this building
        const units: Building["units"] = [];
        for (const u of (b.units ?? [])) {
          const uRes = await fetch(`/api/properties/${propertyId}/units`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              buildingId:       building.id,
              number:           u.number           ?? "",
              type:             u.type             ?? "APARTMENT",
              floor:            (u as any).floor            ?? null,
              entrance:         (u as any).entrance         ?? null,
              sizeSqm:          (u as any).sizeSqm          ?? null,
              coOwnershipShare: (u as any).coOwnershipShare ?? null,
              yearBuilt:        (u as any).yearBuilt        ?? null,
              rooms:            (u as any).rooms            ?? null,
            }),
          });
          if (uRes.ok) units.push(await uRes.json());
        }

        createdBuildings.push({ ...building, units });
      }

      onPrefillApplied(createdBuildings);
      toast(`Added ${createdBuildings.length} building(s) from document`, "success");
      setExtracted(null);
    } catch {
      toast("Failed to apply prefill", "error");
    } finally {
      setApplying(false);
    }
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
                <th className="text-left px-4 py-2.5 text-xs font-medium text-tertiary uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-tertiary uppercase tracking-wide">Size</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-tertiary uppercase tracking-wide">Uploaded</th>
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
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline"
                    >
                      Download
                    </a>
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
