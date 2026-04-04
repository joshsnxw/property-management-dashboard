import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { PropertiesTable } from "@/components/properties/PropertiesTable";

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    include: {
      manager:   true,
      accountant:true,
      _count: { select: { buildings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch unit counts separately (Prisma v7 nested count via buildings)
  const propertiesWithUnits = await Promise.all(
    properties.map(async (p) => {
      const unitCount = await prisma.unit.count({
        where: { building: { propertyId: p.id } },
      });
      return { ...p, unitCount };
    })
  );

  return (
    <AppShell breadcrumb="Properties">
      <PropertiesTable properties={propertiesWithUnits} />
    </AppShell>
  );
}
