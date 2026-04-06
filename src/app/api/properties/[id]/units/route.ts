import { prisma } from "@/lib/prisma";
import { parseBody, validate } from "@/lib/api";
import { CreateUnitForBuildingSchema } from "@/lib/validations/property";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  void (await params); // propertyId unused — buildingId in body determines placement

  const body = await parseBody(request);
  if (!body.ok) return body.response;

  const parsed = validate(CreateUnitForBuildingSchema, body.data);
  if (!parsed.ok) return parsed.response;

  const unit = await prisma.unit.create({ data: parsed.data });
  return Response.json(unit, { status: 201 });
}
