"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { FormField, fieldInputClass } from "@/components/ui/FormField";
import { apiFetch } from "@/lib/client";
import { TH_CLASS } from "@/lib/utils";

interface Contact {
  id:          string;
  name:        string;
  role:        "MANAGER" | "ACCOUNTANT";
  street:      string | null;
  houseNumber: string | null;
  postalCode:  string | null;
  city:        string | null;
}

type ContactRole = Contact["role"];

interface Props {
  contacts: Contact[];
}

const ROLE_LABEL: Record<ContactRole, string> = {
  MANAGER:    "Manager",
  ACCOUNTANT: "Accountant",
};

const ROLE_CLASS: Record<ContactRole, string> = {
  MANAGER:    "bg-accent-dim text-accent border-accent-border",
  ACCOUNTANT: "bg-green-dim text-green border-green/20",
};

const emptyForm = { name: "", role: "MANAGER" as ContactRole, street: "", houseNumber: "", postalCode: "", city: "" };

export function ContactsTable({ contacts: initial }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [contacts, setContacts]       = useState<Contact[]>(initial);
  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState("ALL");
  const [cityFilter, setCityFilter]   = useState("ALL");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen]       = useState(false);
  const [editing, setEditing]           = useState<Contact | null>(null);
  const [form, setForm]                 = useState(emptyForm);
  const [saving, setSaving]             = useState(false);
  const [showErrors, setShowErrors]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);

  const cities = useMemo(
    () => Array.from(new Set(contacts.map((c) => c.city).filter(Boolean))) as string[],
    [contacts]
  );

  const activeFilterCount = (roleFilter !== "ALL" ? 1 : 0) + (cityFilter !== "ALL" ? 1 : 0);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        q === "" ||
        c.name.toLowerCase().includes(q) ||
        (c.city ?? "").toLowerCase().includes(q) ||
        (c.street ?? "").toLowerCase().includes(q);
      const matchRole = roleFilter === "ALL" || c.role === roleFilter;
      const matchCity = cityFilter === "ALL" || c.city === cityFilter;
      return matchSearch && matchRole && matchCity;
    });
  }, [contacts, search, roleFilter, cityFilter]);

  const kpis = useMemo(() => ({
    total:      contacts.length,
    managers:   contacts.filter((c) => c.role === "MANAGER").length,
    accountants:contacts.filter((c) => c.role === "ACCOUNTANT").length,
  }), [contacts]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowErrors(false);
    setModalOpen(true);
  }

  function openEdit(c: Contact) {
    setEditing(c);
    setForm({
      name:        c.name,
      role:        c.role,
      street:      c.street      ?? "",
      houseNumber: c.houseNumber ?? "",
      postalCode:  c.postalCode  ?? "",
      city:        c.city        ?? "",
    });
    setShowErrors(false);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  async function handleSave() {
    if (!form.name.trim()) { setShowErrors(true); toast("Name is required", "error"); return; }
    setSaving(true);
    const body = {
      name:        form.name.trim(),
      role:        form.role,
      street:      form.street      || null,
      houseNumber: form.houseNumber || null,
      postalCode:  form.postalCode  || null,
      city:        form.city        || null,
    };
    const json = { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };

    if (editing) {
      const updated = await apiFetch<Contact>(
        `/api/contacts/${editing.id}`, { method: "PATCH", ...json }, toast, "Failed to update contact",
      );
      setSaving(false);
      if (!updated) return;
      setContacts((prev) => prev.map((c) => c.id === updated.id ? updated : c));
      toast("Contact updated", "success");
    } else {
      const created = await apiFetch<Contact>(
        "/api/contacts", { method: "POST", ...json }, toast, "Failed to create contact",
      );
      setSaving(false);
      if (!created) return;
      setContacts((prev) => prev.some((c) => c.id === created.id) ? prev : [...prev, created]);
      toast("Contact added", "success");
    }

    closeModal();
    router.refresh();
  }

  async function handleDelete() {
    if (!editing) return;
    setDeleting(true);
    const result = await apiFetch(
      `/api/contacts/${editing.id}`, { method: "DELETE" }, toast, "Failed to delete contact",
    );
    setDeleting(false);
    setConfirmDelete(false);
    if (result === null) return;
    setContacts((prev) => prev.filter((c) => c.id !== editing.id));
    toast("Contact deleted", "success");
    closeModal();
    router.refresh();
  }

  const ic = (empty: boolean) => fieldInputClass(showErrors && empty);
  const selectClass = "px-3 py-1.5 text-sm rounded-md border border-border bg-bg-0 text-primary focus:outline-none focus:border-accent";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-primary">Contacts</h1>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Total"       value={kpis.total} />
        <KpiCard label="Managers"    value={kpis.managers} />
        <KpiCard label="Accountants" value={kpis.accountants} />
      </div>

      {/* Search + filter toggle + new contact */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search contacts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm rounded-md border border-border bg-bg-0 text-primary placeholder:text-tertiary focus:outline-none focus:border-accent"
            suppressHydrationWarning
          />
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
              filtersOpen || activeFilterCount > 0
                ? "border-accent bg-accent-dim text-accent"
                : "border-border bg-bg-0 text-secondary hover:text-primary"
            }`}
          >
            <FilterIcon />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white text-[10px] font-medium">
                {activeFilterCount}
              </span>
            )}
          </button>
          <Button size="sm" onClick={openNew}>+ New contact</Button>
        </div>

        {filtersOpen && (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-bg-1 px-3 py-2.5">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectClass}>
              <option value="ALL">All roles</option>
              <option value="MANAGER">Manager</option>
              <option value="ACCOUNTANT">Accountant</option>
            </select>
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className={selectClass}>
              <option value="ALL">All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => { setRoleFilter("ALL"); setCityFilter("ALL"); }}
                className="text-xs text-tertiary hover:text-primary transition-colors ml-auto"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-bg-1">
            <tr>
              <th className={TH_CLASS}>Name</th>
              <th className={TH_CLASS}>Role</th>
              <th className={TH_CLASS}>Street</th>
              <th className={TH_CLASS}>No.</th>
              <th className={TH_CLASS}>Postal code</th>
              <th className={TH_CLASS}>City</th>
              <th className={TH_CLASS} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-tertiary">
                  No contacts found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-bg-1 transition-colors group">
                  <td className="px-3 py-3 font-medium text-primary">{c.name}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-sm text-xs font-medium border ${ROLE_CLASS[c.role]}`}>
                      {ROLE_LABEL[c.role]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-secondary">{c.street ?? <span className="text-tertiary">—</span>}</td>
                  <td className="px-3 py-3 text-secondary">{c.houseNumber ?? <span className="text-tertiary">—</span>}</td>
                  <td className="px-3 py-3 text-secondary">{c.postalCode ?? <span className="text-tertiary">—</span>}</td>
                  <td className="px-3 py-3 text-secondary">{c.city ?? <span className="text-tertiary">—</span>}</td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-tertiary hover:text-primary p-1 rounded"
                      aria-label="Edit contact"
                    >
                      <EditIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit modal */}
      <Modal open={modalOpen} onClose={closeModal}>
        <h2 className="text-sm font-semibold text-primary">
          {editing ? "Edit contact" : "New contact"}
        </h2>

        {/* Name + Role */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Name" required className="col-span-2">
            <input
              autoComplete="off"
              className={ic(!form.name.trim())}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Full name"
            />
          </FormField>
          <FormField label="Role" required className="col-span-2">
            <select
              className={ic(false)}
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as ContactRole }))}
            >
              <option value="MANAGER">Manager</option>
              <option value="ACCOUNTANT">Accountant</option>
            </select>
          </FormField>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            <FormField label="Street" className="col-span-2">
              <input
                autoComplete="off"
                className={ic(false)}
                value={form.street}
                onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                placeholder="Street"
              />
            </FormField>
            <FormField label="No.">
              <input
                autoComplete="off"
                className={ic(false)}
                value={form.houseNumber}
                onChange={(e) => setForm((f) => ({ ...f, houseNumber: e.target.value }))}
                placeholder="No."
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Postal code">
              <input
                autoComplete="off"
                className={ic(false)}
                value={form.postalCode}
                onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                placeholder="Postal code"
              />
            </FormField>
            <FormField label="City">
              <input
                autoComplete="off"
                className={ic(false)}
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="City"
              />
            </FormField>
          </div>
        </div>

        {editing && (
          <div className="pt-3 border-t border-red/20">
            <p className="text-xs text-tertiary mb-2">Danger zone</p>
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} disabled={deleting}>
              Delete contact
            </Button>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={closeModal}
            className="px-3 py-1.5 text-xs rounded-md border border-border text-secondary hover:text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 text-xs rounded-md bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Add contact"}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete contact?"
        message={`This will permanently delete "${editing?.name}". This cannot be undone.`}
        confirmLabel={deleting ? "Deleting…" : "Delete contact"}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
