import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PropertyDetailView } from "@/components/properties/detail/PropertyDetailView";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      manager:   true,
      accountant:true,
      buildings: { include: { units: { orderBy: { number: "asc" } } } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!property) notFound();

  // Serialize dates to strings for client component
  const serialized = JSON.parse(JSON.stringify(property));

  return <PropertyDetailView initial={serialized} />;
}
