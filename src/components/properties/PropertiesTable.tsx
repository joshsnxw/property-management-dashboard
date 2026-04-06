"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusDot } from "@/components/ui/StatusDot";

interface Property {
  id: string;
  name: string;
  address: string;
  number: string;
  type: "WEG" | "MV";
  status: "ACTIVE" | "PENDING" | "ARCHIVED";
  manager:    { name: string } | null;
  accountant: { name: string } | null;
  _count: { buildings: number };
  unitCount: number;
}

interface PropertiesTableProps {
  properties: Property[];
}

const th = "text-left px-3 py-2.5 text-xs font-medium text-tertiary uppercase tracking-wide whitespace-nowrap";

export function PropertiesTable({ properties }: PropertiesTableProps) {
  const [search, setSearch]               = useState("");
  const [typeFilter, setTypeFilter]       = useState<"ALL" | "WEG" | "MV">("ALL");
  const [managerFilter, setManagerFilter]     = useState("ALL");
  const [accountantFilter, setAccountantFilter] = useState("ALL");
  const [statusFilter, setStatusFilter]         = useState("ALL");
  const [filtersOpen, setFiltersOpen]           = useState(false);

  const activeFilterCount = (typeFilter !== "ALL" ? 1 : 0) + (managerFilter !== "ALL" ? 1 : 0) + (accountantFilter !== "ALL" ? 1 : 0) + (statusFilter !== "ALL" ? 1 : 0);

  const managers = useMemo(
    () => Array.from(new Set(properties.map((p) => p.manager?.name).filter(Boolean))) as string[],
    [properties]
  );
  const accountants = useMemo(
    () => Array.from(new Set(properties.map((p) => p.accountant?.name).filter(Boolean))) as string[],
    [properties]
  );

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.number.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase());
      const matchType      = typeFilter      === "ALL" || p.type            === typeFilter;
      const matchManager   = managerFilter   === "ALL" || p.manager?.name   === managerFilter;
      const matchAccountant = accountantFilter === "ALL" || p.accountant?.name === accountantFilter;
      const matchStatus     = statusFilter     === "ALL" || p.status           === statusFilter;
      return matchSearch && matchType && matchManager && matchAccountant && matchStatus;
    });
  }, [properties, search, typeFilter, managerFilter, accountantFilter, statusFilter]);

  const kpis = useMemo(() => ({
    total:      properties.length,
    weg:        properties.filter((p) => p.type === "WEG").length,
    mv:         properties.filter((p) => p.type === "MV").length,
    totalUnits: properties.reduce((sum, p) => sum + p.unitCount, 0),
  }), [properties]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-primary">Properties</h1>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Total"       value={kpis.total} />
        <KpiCard label="WEG"         value={kpis.weg} />
        <KpiCard label="MV"          value={kpis.mv} />
        <KpiCard label="Total units" value={kpis.totalUnits} />
      </div>

      {/* Search + filter toggle + new property */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search properties…"
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
          <Link href="/properties/new">
            <Button size="sm">+ New property</Button>
          </Link>
        </div>

        {filtersOpen && (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-bg-1 px-3 py-2.5">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "ALL" | "WEG" | "MV")}
              className="px-3 py-1.5 text-sm rounded-md border border-border bg-bg-0 text-primary focus:outline-none focus:border-accent"
            >
              <option value="ALL">All types</option>
              <option value="WEG">WEG</option>
              <option value="MV">MV</option>
            </select>
            <select
              value={managerFilter}
              onChange={(e) => setManagerFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-md border border-border bg-bg-0 text-primary focus:outline-none focus:border-accent"
            >
              <option value="ALL">All managers</option>
              {managers.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={accountantFilter}
              onChange={(e) => setAccountantFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-md border border-border bg-bg-0 text-primary focus:outline-none focus:border-accent"
            >
              <option value="ALL">All accountants</option>
              {accountants.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-md border border-border bg-bg-0 text-primary focus:outline-none focus:border-accent"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => { setTypeFilter("ALL"); setManagerFilter("ALL"); setAccountantFilter("ALL"); setStatusFilter("ALL"); }}
                className="text-xs text-tertiary hover:text-primary transition-colors ml-auto"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table — horizontally scrollable on narrow screens */}
      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm table-fixed min-w-[780px]">
          <colgroup>
            <col />
            <col className="w-28" />
            <col className="w-16" />
            <col className="w-24" />
            <col className="w-14" />
            <col className="w-32" />
            <col className="w-32" />
            <col className="w-24" />
          </colgroup>
          <thead>
            <tr className="bg-bg-1 border-b border-border">
              <th className={th}>Property</th>
              <th className={th}>Number</th>
              <th className={th}>Type</th>
              <th className={th}>Buildings</th>
              <th className={th}>Units</th>
              <th className={th}>Manager</th>
              <th className={th}>Accountant</th>
              <th className={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-tertiary">
                  No properties found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-bg-1 transition-colors"
                >
                  <td className="px-3 py-3">
                    <Link href={`/properties/${p.id}`} className="block">
                      <span className="font-medium text-primary hover:text-accent transition-colors">
                        {p.name}
                      </span>
                      <span className="block text-xs text-tertiary truncate">{p.address}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-secondary font-mono text-xs">{p.number}</td>
                  <td className="px-3 py-3">
                    <Badge variant={p.type.toLowerCase() as "weg" | "mv"} />
                  </td>
                  <td className="px-3 py-3 text-secondary text-center">{p._count.buildings}</td>
                  <td className="px-3 py-3 text-secondary text-center">{p.unitCount}</td>
                  <td className="px-3 py-3 text-secondary truncate">{p.manager?.name ?? <span className="text-tertiary">—</span>}</td>
                  <td className="px-3 py-3 text-secondary truncate">{p.accountant?.name ?? <span className="text-tertiary">—</span>}</td>
                  <td className="px-3 py-3">
                    <StatusDot status={p.status.toLowerCase() as "active" | "pending" | "archived"} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
