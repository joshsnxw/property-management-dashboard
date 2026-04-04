import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PatchUnitSchema = z.object({
  number:          z.string().min(1).optional(),
  type:            z.enum(["APARTMENT", "OFFICE", "GARDEN", "PARKING"]).optional(),
  floor:           z.string().optional(),
  entrance:        z.string().optional(),
  sizeSqm:         z.number().positive().optional(),
  coOwnershipShare:z.string().optional(),
  yearBuilt:       z.number().int().optional(),
  rooms:           z.number().positive().optional(),
  buildingId:      z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const result = PatchUnitSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: "Validation failed", fields: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  try {
    const unit = await prisma.unit.update({ where: { id }, data: result.data });
    return Response.json(unit);
  } catch {
    return Response.json({ error: "Unit not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.unit.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
