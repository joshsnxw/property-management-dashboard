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
  manager: { name: string };
  _count: { buildings: number };
  unitCount: number;
}

interface PropertiesTableProps {
  properties: Property[];
}

export function PropertiesTable({ properties }: PropertiesTableProps) {
  const [search, setSearch]           = useState("");
  const [typeFilter, setTypeFilter]   = useState<"ALL" | "WEG" | "MV">("ALL");
  const [managerFilter, setManagerFilter] = useState("ALL");

  const managers = useMemo(
    () => Array.from(new Set(properties.map((p) => p.manager.name))),
    [properties]
  );

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.number.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "ALL" || p.type === typeFilter;
      const matchManager = managerFilter === "ALL" || p.manager.name === managerFilter;
      return matchSearch && matchType && matchManager;
    });
  }, [properties, search, typeFilter, managerFilter]);

  const kpis = useMemo(() => ({
    total:      properties.length,
    weg:        properties.filter((p) => p.type === "WEG").length,
    mv:         properties.filter((p) => p.type === "MV").length,
    totalUnits: properties.reduce((sum, p) => sum + p.unitCount, 0),
  }), [properties]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-primary">Properties</h1>
        <Link href="/properties/new">
          <Button size="sm">+ New property</Button>
        </Link>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Total"       value={kpis.total} />
        <KpiCard label="WEG"         value={kpis.weg} />
        <KpiCard label="MV"          value={kpis.mv} />
        <KpiCard label="Total units" value={kpis.totalUnits} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search properties…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-md border border-border bg-bg-0 text-primary placeholder:text-tertiary focus:outline-none focus:border-accent w-56"
        />
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
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-1 border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-tertiary uppercase tracking-wide">Property</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-tertiary uppercase tracking-wide">Number</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-tertiary uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-tertiary uppercase tracking-wide">Buildings</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-tertiary uppercase tracking-wide">Units</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-tertiary uppercase tracking-wide">Manager</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-tertiary uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-tertiary">
                  No properties found.
                </td>
              </tr>
            ) : (
              filtered.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-border last:border-0 hover:bg-bg-1 transition-colors cursor-pointer ${
                    i % 2 === 0 ? "bg-bg-0" : "bg-bg-0"
                  }`}
                >
                  <td className="px-4 py-3">
                    <Link href={`/properties/${p.id}`} className="block">
                      <span className="font-medium text-primary hover:text-accent transition-colors">
                        {p.name}
                      </span>
                      <span className="block text-xs text-tertiary">{p.address}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-secondary font-mono text-xs">{p.number}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.type.toLowerCase() as "weg" | "mv"} />
                  </td>
                  <td className="px-4 py-3 text-secondary">{p._count.buildings}</td>
                  <td className="px-4 py-3 text-secondary">{p.unitCount}</td>
                  <td className="px-4 py-3 text-secondary">{p.manager.name}</td>
                  <td className="px-4 py-3">
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
