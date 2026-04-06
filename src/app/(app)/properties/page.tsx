import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { PropertiesTable } from "@/components/properties/PropertiesTable";

export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const [properties, unitCounts] = await Promise.all([
    prisma.property.findMany({
      include: {
        manager:   true,
        accountant:true,
        _count: { select: { buildings: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Unit→Building→Property requires two hops; aggregate in one query instead of N.
    // COUNT returns bigint in Postgres; ::int casts to int4 so Prisma maps it to number.
    prisma.$queryRaw<{ propertyId: string; count: number }[]>`
      SELECT b."propertyId", COUNT(u.id)::int AS count
      FROM "Building" b
      JOIN "Unit" u ON u."buildingId" = b.id
      GROUP BY b."propertyId"
    `,
  ]);

  const unitCountMap = new Map(unitCounts.map((r) => [r.propertyId, r.count]));

  const rows = properties.map((p) => ({
    id:         p.id,
    name:       p.name,
    address:    p.address,
    number:     p.number,
    type:       p.type,
    status:     p.status,
    manager:    p.manager    ? { name: p.manager.name }    : null,
    accountant: p.accountant ? { name: p.accountant.name } : null,
    _count:     { buildings: p._count.buildings },
    unitCount:  unitCountMap.get(p.id) ?? 0,
  }));

  return (
    <AppShell breadcrumb="Properties">
      <PropertiesTable properties={rows} />
    </AppShell>
  );
}
