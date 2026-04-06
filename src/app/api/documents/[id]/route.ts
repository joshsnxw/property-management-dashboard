import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

    await prisma.document.delete({ where: { id } });
    await del(doc.url);

    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
