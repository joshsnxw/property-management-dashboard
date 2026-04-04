import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateUnitSchema = z.object({
  number:          z.string().min(1),
  type:            z.enum(["APARTMENT", "OFFICE", "GARDEN", "PARKING"]),
  floor:           z.string().optional(),
  entrance:        z.string().optional(),
  sizeSqm:         z.number().positive().optional(),
  coOwnershipShare:z.string().optional(),
  yearBuilt:       z.number().int().optional(),
  rooms:           z.number().positive().optional(),
  buildingId:      z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  void (await params); // propertyId unused — buildingId in body determines placement
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const result = CreateUnitSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: "Validation failed", fields: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const unit = await prisma.unit.create({ data: result.data });
  return Response.json(unit, { status: 201 });
}
