import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, role, street, houseNumber, postalCode, city } = body as {
    name?: string;
    role?: string;
    street?: string | null;
    houseNumber?: string | null;
    postalCode?: string | null;
    city?: string | null;
  };

  if (!name?.trim() || !["MANAGER", "ACCOUNTANT"].includes(role ?? "")) {
    return Response.json({ error: "name and role are required" }, { status: 400 });
  }

  try {
    const updated = await prisma.contact.update({
      where: { id },
      data: {
        name:        name.trim(),
        role:        role as "MANAGER" | "ACCOUNTANT",
        street:      street      ?? null,
        houseNumber: houseNumber ?? null,
        postalCode:  postalCode  ?? null,
        city:        city        ?? null,
      },
    });
    return Response.json(updated);
  } catch {
    return Response.json({ error: "Contact not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.contact.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Contact not found" }, { status: 404 });
  }
}
