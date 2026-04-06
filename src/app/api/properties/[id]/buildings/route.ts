import { prisma } from "@/lib/prisma";
import { parseBody, validate } from "@/lib/api";
import { BuildingSchema } from "@/lib/validations/property";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await parseBody(request);
  if (!body.ok) return body.response;

  const parsed = validate(BuildingSchema, body.data);
  if (!parsed.ok) return parsed.response;

  const building = await prisma.building.create({
    data: { ...parsed.data, propertyId: id },
    include: { units: true },
  });
  return Response.json(building, { status: 201 });
}
