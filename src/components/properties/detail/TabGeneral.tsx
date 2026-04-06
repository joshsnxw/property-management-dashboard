"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/StatusDot";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useEditDraft } from "@/hooks/useEditDraft";
import { apiFetch } from "@/lib/client";
import { PropertyDetail, Contact } from "./types";

interface Props {
  property: PropertyDetail;
  onUpdate: (updated: PropertyDetail) => void;
}

interface Draft {
  name:        string;
  address:     string;
  number:      string;
  type:        "WEG" | "MV";
  status:      "ACTIVE" | "PENDING" | "ARCHIVED";
  managerId:   string;
  accountantId:string;
}

function toDraft(p: PropertyDetail): Draft {
  return {
    name:        p.name,
    address:     p.address,
    number:      p.number,
    type:        p.type,
    status:      p.status,
    managerId:   p.managerId,
    accountantId:p.accountantId,
  };
}

export function TabGeneral({ property, onUpdate }: Props) {
  const { toast } = useToast();
  const router    = useRouter();

  const { draft, patch, isDirty, editing, startEdit, cancelEdit } =
    useEditDraft(property, toDraft);

  const [saving, setSaving]               = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [contacts, setContacts]           = useState<Contact[]>([]);

  useEffect(() => {
    fetch("/api/contacts").then((r) => r.json()).then(setContacts).catch(() => {});
  }, []);

  const managers    = contacts.filter((c) => c.role === "MANAGER");
  const accountants = contacts.filter((c) => c.role === "ACCOUNTANT");

  async function save() {
    setSaving(true);
    const updated = await apiFetch<PropertyDetail>(
      `/api/properties/${property.id}`,
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) },
      toast,
      "Failed to save",
    );
    setSaving(false);
    if (!updated) return;
    onUpdate({ ...property, ...updated });
    cancelEdit();
    toast("Changes saved", "success");
  }

  async function deleteProperty() {
    setDeleting(true);
    const result = await apiFetch(
      `/api/properties/${property.id}`,
      { method: "DELETE" },
      toast,
      "Failed to delete property",
    );
    setDeleting(false);
    setConfirmDelete(false);
    if (result === null) return;
    router.push("/properties");
  }

  const inputClass =
    "w-full px-3 py-1.5 text-sm rounded-md border border-border bg-bg-0 text-primary focus:outline-none focus:border-accent transition-colors";
  const labelClass = "text-xs font-medium text-tertiary uppercase tracking-wide";
  const valueClass = "text-sm text-primary";

  return (
    <div className="flex flex-col gap-5">
      {/* Unsaved changes banner */}
      {editing && isDirty && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-amber/10 border border-amber/30 rounded-md">
          <span className="text-xs text-amber font-medium">Unsaved changes</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}

      {/* Edit toggle */}
      {!editing && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={startEdit}>Edit</Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        {/* Name */}
        <div className="col-span-2 flex flex-col gap-1">
          <span className={labelClass}>Name</span>
          {editing
            ? <input className={inputClass} value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
            : <span className={valueClass}>{property.name}</span>}
        </div>

        {/* Address */}
        <div className="col-span-2 flex flex-col gap-1">
          <span className={labelClass}>Address</span>
          {editing
            ? <input className={inputClass} value={draft.address} onChange={(e) => patch({ address: e.target.value })} />
            : <span className={valueClass}>{property.address}</span>}
        </div>

        {/* Number */}
        <div className="flex flex-col gap-1">
          <span className={labelClass}>Number</span>
          {editing
            ? <input className={inputClass} value={draft.number} onChange={(e) => patch({ number: e.target.value })} />
            : <span className="font-mono text-sm text-primary">{property.number}</span>}
        </div>

        {/* Type */}
        <div className="flex flex-col gap-1">
          <span className={labelClass}>Type</span>
          {editing ? (
            <select className={inputClass} value={draft.type} onChange={(e) => patch({ type: e.target.value as Draft["type"] })}>
              <option value="WEG">WEG</option>
              <option value="MV">MV</option>
            </select>
          ) : (
            <span className={valueClass}>{property.type}</span>
          )}
        </div>

        {/* Accountant */}
        <div className="flex flex-col gap-1">
          <span className={labelClass}>Accountant</span>
          {editing ? (
            <select className={inputClass} value={draft.accountantId} onChange={(e) => patch({ accountantId: e.target.value })}>
              {accountants.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          ) : (
            <span className={valueClass}>{property.accountant?.name ?? "—"}</span>
          )}
        </div>

        {/* Manager */}
        <div className="flex flex-col gap-1">
          <span className={labelClass}>Manager</span>
          {editing ? (
            <select className={inputClass} value={draft.managerId} onChange={(e) => patch({ managerId: e.target.value })}>
              {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          ) : (
            <span className={valueClass}>{property.manager?.name ?? "—"}</span>
          )}
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <span className={labelClass}>Status</span>
          {editing ? (
            <select className={inputClass} value={draft.status} onChange={(e) => patch({ status: e.target.value as Draft["status"] })}>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          ) : (
            <StatusDot status={property.status.toLowerCase() as "active" | "pending" | "archived"} />
          )}
        </div>

        {/* Created */}
        <div className="flex flex-col gap-1">
          <span className={labelClass}>Created</span>
          <span className={valueClass}>
            {new Date(property.createdAt).toLocaleDateString("de-DE")}
          </span>
        </div>
      </div>

      {/* Save/Cancel at bottom when editing with no dirty state yet */}
      {editing && !isDirty && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
        </div>
      )}

      {/* Danger zone — only visible while editing */}
      {editing && (
        <div className="pt-4 border-t border-red/20 mt-2">
          <p className="text-xs text-tertiary mb-2">Danger zone</p>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            disabled={deleting}
          >
            Delete property
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete property?"
        message={`This will permanently delete "${property.name}" along with all its buildings, units, and documents. This cannot be undone.`}
        confirmLabel={deleting ? "Deleting…" : "Delete property"}
        onConfirm={deleteProperty}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
