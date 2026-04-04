import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PatchPropertySchema = z.object({
  name:        z.string().min(1).optional(),
  address:     z.string().min(1).optional(),
  number:      z.string().min(1).optional(),
  type:        z.enum(["WEG", "MV"]).optional(),
  status:      z.enum(["ACTIVE", "PENDING", "ARCHIVED"]).optional(),
  managerId:   z.string().min(1).optional(),
  accountantId:z.string().min(1).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
  if (!property) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(property);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const result = PatchPropertySchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: "Validation failed", fields: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  try {
    const property = await prisma.property.update({
      where: { id },
      data: result.data,
      include: { manager: true, accountant: true },
    });
    return Response.json(property);
  } catch {
    return Response.json({ error: "Property not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.property.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
