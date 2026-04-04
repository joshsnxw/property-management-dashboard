import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateDocumentSchema = z.object({
  name:      z.string().min(1, "Name is required"),
  url:       z.string().url("Must be a valid URL"),
  sizeBytes: z.number().int().positive().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const result = CreateDocumentSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: "Validation failed", fields: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  try {
    const doc = await prisma.document.create({
      data: { ...result.data, propertyId: id },
    });
    return Response.json(doc, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create document" }, { status: 500 });
  }
}
