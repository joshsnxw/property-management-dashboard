"use client";

import { UploadZone } from "@/components/ui/UploadZone";
import { useToast } from "@/components/ui/Toast";
import { Document } from "./types";

interface Props {
  propertyId: string;
  documents:  Document[];
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TabDocuments({ propertyId, documents }: Props) {
  const { toast } = useToast();

  function handleFiles(files: FileList) {
    // Placeholder — Vercel Blob integration in Phase 9
    toast(`Upload ready: ${files[0].name} (Vercel Blob not yet configured)`, "info");
    void propertyId;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Upload zone */}
      <UploadZone onFiles={handleFiles} label="Drop documents here or click to upload" />

      {/* Document list */}
      {documents.length === 0 ? (
        <p className="text-sm text-tertiary text-center py-4">No documents uploaded yet.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
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
    </div>
  );
}
