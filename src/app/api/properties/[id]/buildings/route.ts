import { prisma } from "@/lib/prisma";
import { BuildingSchema } from "@/lib/validations/property";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const result = BuildingSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: "Validation failed", fields: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const building = await prisma.building.create({
    data: { ...result.data, propertyId: id },
    include: { units: true },
  });
  return Response.json(building, { status: 201 });
}
