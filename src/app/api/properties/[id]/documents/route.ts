import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { name, url, sizeBytes } = body as { name: string; url: string; sizeBytes?: number };
  if (!name || !url) {
    return Response.json({ error: "name and url are required" }, { status: 400 });
  }
  const doc = await prisma.document.create({
    data: { name, url, sizeBytes, propertyId: id },
  });
  return Response.json(doc, { status: 201 });
}
