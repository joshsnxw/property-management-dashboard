import { prisma } from "@/lib/prisma";
import { BuildingSchema } from "@/lib/validations/property";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const result = BuildingSchema.partial().safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: "Validation failed", fields: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  try {
    const building = await prisma.building.update({
      where: { id },
      data: result.data,
      include: { units: true },
    });
    return Response.json(building);
  } catch {
    return Response.json({ error: "Building not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.building.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
