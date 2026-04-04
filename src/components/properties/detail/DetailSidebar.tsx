import { Badge } from "@/components/ui/Badge";
import { PropertyDetail } from "./types";

type Tab = "general" | "buildings" | "units" | "documents";

interface Props {
  property: PropertyDetail;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string }[] = [
  { id: "general",   label: "General info" },
  { id: "buildings", label: "Buildings" },
  { id: "units",     label: "Units" },
  { id: "documents", label: "Documents" },
];

export function DetailSidebar({ property, activeTab, onTabChange }: Props) {
  return (
    <aside className="w-52 shrink-0 flex flex-col gap-4">
      {/* Property identity */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-primary leading-tight">
          {property.name}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-tertiary">{property.number}</span>
          <Badge variant={property.type.toLowerCase() as "weg" | "mv"} />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === id
                ? "bg-accent-dim text-accent font-medium"
                : "text-secondary hover:bg-bg-2 hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
