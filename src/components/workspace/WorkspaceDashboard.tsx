"use client";

// ─── Mock data ────────────────────────────────────────────────────────────────

const KPI_DATA = [
  { label: "Occupancy",      value: "87%",    sub: "47 / 54 units",    trend: "+2% vs last month" },
  { label: "Vacant units",   value: "7",      sub: "across 6 properties", trend: "−1 vs last month" },
  { label: "Open requests",  value: "3",      sub: "1 high priority",  trend: "+1 this week" },
  { label: "Rent outstanding", value: "€4,200", sub: "2 overdue leases", trend: "Due by 31 Jan" },
  { label: "Pending tasks",  value: "5",      sub: "setup incomplete", trend: "3 properties" },
];

const OCCUPANCY_BY_PROPERTY = [
  { name: "Parkview Residences",    occupied: 14, total: 14 },
  { name: "Wohnanlage Winsviertel", occupied: 3,  total: 3  },
  { name: "Residenz Charlottenburg",occupied: 3,  total: 4  },
  { name: "Gewerbehaus Mitte",      occupied: 4,  total: 5  },
  { name: "Wohnanlage Prenzlauer",  occupied: 6,  total: 8  },
  { name: "Lager Spandau",          occupied: 2,  total: 2  },
];

const RENT_MONTHS = ["Oct", "Nov", "Dec", "Jan"];
const RENT_COLLECTED  = [18400, 19200, 17800, 16600];
const RENT_OUTSTANDING = [0, 600, 1200, 4200];

const MAINTENANCE = [
  { label: "High",   count: 1, color: "bg-red"     },
  { label: "Medium", count: 2, color: "bg-yellow"  },
  { label: "Low",    count: 0, color: "bg-green"   },
];

const EXPIRATIONS = [
  { property: "Residenz Charlottenburg", unit: "03",  tenant: "M. Fischer",  days: 18 },
  { property: "Gewerbehaus Mitte",       unit: "06",  tenant: "TechStart GmbH", days: 34 },
  { property: "Wohnanlage Prenzlauer",   unit: "12",  tenant: "L. Braun",    days: 55 },
];

const PENDING_TASKS = [
  { property: "Wohnanlage Winsviertel",  issue: "No accountant assigned",           tag: "Setup"    },
  { property: "Lager Spandau",           issue: "3 units missing co-ownership share", tag: "Data"   },
  { property: "Gewerbehaus Mitte",       issue: "No documents uploaded",             tag: "Document" },
  { property: "Residenz Charlottenburg", issue: "Status still Pending",              tag: "Setup"    },
  { property: "Wohnanlage Prenzlauer",   issue: "2 units missing co-ownership share", tag: "Data"   },
];

const TAG_CLASS: Record<string, string> = {
  Setup:    "bg-orange-50 text-orange-600 border-orange-200",
  Data:     "bg-red-50 text-red-600 border-red-200",
  Document: "bg-yellow-50 text-yellow-600 border-yellow-200",
};

const URGENCY_CLASS = (days: number) =>
  days <= 21 ? "text-red" : days <= 45 ? "text-yellow" : "text-secondary";

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkspaceDashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-primary">Workspace</h1>
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-yellow/10 text-yellow border border-yellow/20">
          Beta
        </span>
        <p className="text-xs text-tertiary ml-1">Live analytics coming soon — data below is for illustration.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {KPI_DATA.map(({ label, value, sub, trend }) => (
          <div key={label} className="rounded-lg border border-border bg-bg-0 px-4 py-3 flex flex-col gap-1">
            <p className="text-xs text-tertiary uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-semibold text-primary">{value}</p>
            <p className="text-xs text-tertiary">{sub}</p>
            <p className="text-xs text-secondary mt-0.5">{trend}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Occupancy */}
        <Card title="Occupancy by property" badge="87% avg">
          <div className="flex flex-col gap-2.5">
            {OCCUPANCY_BY_PROPERTY.map(({ name, occupied, total }) => {
              const pct = Math.round((occupied / total) * 100);
              return (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-secondary truncate max-w-[70%]">{name}</span>
                    <span className="text-primary font-medium shrink-0">{occupied}/{total}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Rent collection */}
        <Card title="Rent collection" badge="Last 4 months">
          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-1.5">
              {RENT_MONTHS.map((m, i) => {
                const maxVal = Math.max(...RENT_MONTHS.map((_, j) => RENT_COLLECTED[j] + RENT_OUTSTANDING[j]));
                const collectedH = Math.round((RENT_COLLECTED[i] / maxVal) * 96);
                const outstandingH = Math.round((RENT_OUTSTANDING[i] / maxVal) * 96);
                return (
                  <div key={m} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col gap-px">
                      {outstandingH > 0 && (
                        <div className="w-full rounded-t-sm bg-red/30" style={{ height: outstandingH }} />
                      )}
                      <div
                        className={`w-full bg-accent ${outstandingH === 0 ? "rounded-t-sm" : ""} rounded-b-sm`}
                        style={{ height: collectedH }}
                      />
                    </div>
                    <span className="text-[10px] text-tertiary mt-3">{m}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-xs text-tertiary">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent inline-block" />Collected</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red/30 inline-block" />Outstanding</span>
            </div>
          </div>
        </Card>

        {/* Maintenance */}
        <Card title="Maintenance requests" badge="3 open">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2.5">
              {MAINTENANCE.map(({ label, count }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-secondary">{label} priority</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-1.5 rounded-full bg-bg-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${label === "High" ? "bg-red" : label === "Low" ? "bg-green" : ""}`}
                        style={{
                          width: count > 0 ? `${(count / 3) * 100}%` : "0%",
                          ...(label === "Medium" ? { backgroundColor: "#f59e0b" } : {}),
                        }}
                      />
                    </div>
                    <span className="text-primary font-medium w-4 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-tertiary border-t border-border pt-3">
              Avg resolution time: <span className="text-primary font-medium">4.2 days</span> &nbsp;·&nbsp; 8 resolved this month
            </p>
          </div>
        </Card>

        {/* Lease expirations */}
        <Card title="Upcoming lease expirations" badge="Next 60 days">
          <div className="flex flex-col divide-y divide-border">
            {EXPIRATIONS.map(({ property, unit, tenant, days }) => (
              <div key={`${property}-${unit}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm text-primary">{tenant}</p>
                  <p className="text-xs text-tertiary">{property} · Unit {unit}</p>
                </div>
                <span className={`text-sm font-medium tabular-nums ${URGENCY_CLASS(days)}`}>
                  {days}d
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending tasks — full width */}
        <div className="lg:col-span-2">
          <Card title="Pending tasks" badge={`${PENDING_TASKS.length} items`}>
            <div className="flex flex-col divide-y divide-border">
              {PENDING_TASKS.map(({ property, issue, tag }) => (
                <div key={`${property}-${issue}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm text-primary">{property}</p>
                    <p className="text-xs text-tertiary">{issue}</p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-sm text-xs font-medium border shrink-0 ${TAG_CLASS[tag]}`}>
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

function Card({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-bg-0 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-primary">{title}</h2>
        {badge && (
          <span className="text-xs text-tertiary bg-bg-1 border border-border px-2 py-0.5 rounded-sm">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
