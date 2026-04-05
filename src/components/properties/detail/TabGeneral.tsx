"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/StatusDot";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PropertyDetail, Staff } from "./types";

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
  const { toast }  = useToast();
  const router     = useRouter();
  const [editing, setEditing]         = useState(false);
  const [draft, setDraft]             = useState<Draft>(toDraft(property));
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [staff, setStaff]             = useState<Staff[]>([]);

  useEffect(() => {
    fetch("/api/staff").then((r) => r.json()).then(setStaff).catch(() => {});
  }, []);

  const managers    = staff.filter((s) => s.role === "MANAGER");
  const accountants = staff.filter((s) => s.role === "ACCOUNTANT");

  const isDirty = JSON.stringify(draft) !== JSON.stringify(toDraft(property));

  function startEdit() {
    setDraft(toDraft(property));
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(toDraft(property));
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error ?? "Failed to save", "error");
        return;
      }
      const updated = await res.json();
      onUpdate({ ...property, ...updated });
      setEditing(false);
      toast("Changes saved", "success");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProperty() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/properties/${property.id}`, { method: "DELETE" });
      if (!res.ok) { toast("Failed to delete property", "error"); return; }
      router.push("/properties");
    } catch {
      toast("Network error — could not delete property", "error");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  function set(patch: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...patch }));
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
            ? <input className={inputClass} value={draft.name} onChange={(e) => set({ name: e.target.value })} />
            : <span className={valueClass}>{property.name}</span>}
        </div>

        {/* Address */}
        <div className="col-span-2 flex flex-col gap-1">
          <span className={labelClass}>Address</span>
          {editing
            ? <input className={inputClass} value={draft.address} onChange={(e) => set({ address: e.target.value })} />
            : <span className={valueClass}>{property.address}</span>}
        </div>

        {/* Number */}
        <div className="flex flex-col gap-1">
          <span className={labelClass}>Number</span>
          {editing
            ? <input className={inputClass} value={draft.number} onChange={(e) => set({ number: e.target.value })} />
            : <span className="font-mono text-sm text-primary">{property.number}</span>}
        </div>

        {/* Type */}
        <div className="flex flex-col gap-1">
          <span className={labelClass}>Type</span>
          {editing ? (
            <select className={inputClass} value={draft.type} onChange={(e) => set({ type: e.target.value as Draft["type"] })}>
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
            <select className={inputClass} value={draft.accountantId} onChange={(e) => set({ accountantId: e.target.value })}>
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
            <select className={inputClass} value={draft.managerId} onChange={(e) => set({ managerId: e.target.value })}>
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
            <select className={inputClass} value={draft.status} onChange={(e) => set({ status: e.target.value as Draft["status"] })}>
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
