"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { DetailSidebar } from "./DetailSidebar";
import { TabGeneral } from "./TabGeneral";
import { TabBuildings } from "./TabBuildings";
import { TabUnits } from "./TabUnits";
import { TabDocuments } from "./TabDocuments";
import { PropertyDetail, Building } from "./types";

type Tab = "general" | "buildings" | "units" | "documents";

interface Props {
  initial: PropertyDetail;
}

export function PropertyDetailView({ initial }: Props) {
  const [property, setProperty] = useState<PropertyDetail>(initial);
  const [tab, setTab]           = useState<Tab>("general");

  function updateBuildings(buildings: Building[]) {
    setProperty((p) => ({ ...p, buildings }));
  }

  const breadcrumb = (
    <span>
      <a href="/properties" className="hover:text-primary transition-colors">Properties</a>
      <span className="mx-1.5 text-border-strong">/</span>
      <span className="text-primary">{property.name}</span>
    </span>
  );

  return (
    <AppShell breadcrumb={breadcrumb}>
      <div className="flex gap-8">
        <DetailSidebar property={property} activeTab={tab} onTabChange={setTab} />

        <div className="flex-1 min-w-0 bg-bg-0 border border-border rounded-lg p-6">
          {tab === "general" && (
            <TabGeneral
              property={property}
              onUpdate={(updated) => setProperty(updated)}
            />
          )}
          {tab === "buildings" && (
            <TabBuildings
              propertyId={property.id}
              buildings={property.buildings}
              onUpdate={updateBuildings}
            />
          )}
          {tab === "units" && (
            <TabUnits
              propertyId={property.id}
              buildings={property.buildings}
              onUpdate={updateBuildings}
            />
          )}
          {tab === "documents" && (
            <TabDocuments
              propertyId={property.id}
              documents={property.documents}
              onDocumentAdded={(doc) => setProperty((p) => ({ ...p, documents: [doc, ...p.documents] }))}
              onPrefillApplied={(newBuildings) => updateBuildings([...property.buildings, ...newBuildings])}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
