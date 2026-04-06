import { prisma } from "@/lib/prisma";
import { parseBody, validate } from "@/lib/api";
import { ContactSchema } from "@/lib/validations/contact";

export async function GET() {
  const contacts = await prisma.contact.findMany({ orderBy: { name: "asc" } });
  return Response.json(contacts);
}

export async function POST(request: Request) {
  const body = await parseBody(request);
  if (!body.ok) return body.response;

  const parsed = validate(ContactSchema, body.data);
  if (!parsed.ok) return parsed.response;

  const { name, role, street, houseNumber, postalCode, city } = parsed.data;

  const existing = await prisma.contact.findFirst({
    where: { name: { equals: name.trim(), mode: "insensitive" }, role },
  });
  if (existing) return Response.json(existing);

  const created = await prisma.contact.create({
    data: {
      name:        name.trim(),
      role,
      street:      street      ?? null,
      houseNumber: houseNumber ?? null,
      postalCode:  postalCode  ?? null,
      city:        city        ?? null,
    },
  });
  return Response.json(created, { status: 201 });
}
