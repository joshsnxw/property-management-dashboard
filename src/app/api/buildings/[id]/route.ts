import { prisma } from "@/lib/prisma";
import { parseBody, validate } from "@/lib/api";
import { BuildingSchema } from "@/lib/validations/property";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await parseBody(request);
  if (!body.ok) return body.response;

  const parsed = validate(BuildingSchema.partial(), body.data);
  if (!parsed.ok) return parsed.response;

  try {
    const building = await prisma.building.update({
      where: { id },
      data: parsed.data,
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
