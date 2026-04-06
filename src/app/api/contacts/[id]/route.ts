import { prisma } from "@/lib/prisma";
import { parseBody, validate } from "@/lib/api";
import { ContactSchema } from "@/lib/validations/contact";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const body = await parseBody(request);
  if (!body.ok) return body.response;

  const parsed = validate(ContactSchema, body.data);
  if (!parsed.ok) return parsed.response;

  const { name, role, street, houseNumber, postalCode, city } = parsed.data;

  try {
    const updated = await prisma.contact.update({
      where: { id },
      data: {
        name:        name.trim(),
        role,
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
