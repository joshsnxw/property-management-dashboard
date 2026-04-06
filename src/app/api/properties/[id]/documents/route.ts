import { prisma } from "@/lib/prisma";
import { parseBody, validate } from "@/lib/api";
import { CreateDocumentSchema } from "@/lib/validations/document";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await parseBody(request);
  if (!body.ok) return body.response;

  const parsed = validate(CreateDocumentSchema, body.data);
  if (!parsed.ok) return parsed.response;

  try {
    const doc = await prisma.document.create({
      data: { ...parsed.data, propertyId: id },
    });
    return Response.json(doc, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create document" }, { status: 500 });
  }
}
