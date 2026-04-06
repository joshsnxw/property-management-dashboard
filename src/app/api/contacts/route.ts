import { prisma } from "@/lib/prisma";

export async function GET() {
  const contacts = await prisma.contact.findMany({ orderBy: { name: "asc" } });
  return Response.json(contacts);
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, role, street, houseNumber, postalCode, city } = body as {
    name?: string;
    role?: string;
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
  };

  const validRoles = ["MANAGER", "ACCOUNTANT", "TENANT"];
  if (!name?.trim() || !validRoles.includes(role ?? "")) {
    return Response.json({ error: "name and role (MANAGER|ACCOUNTANT|TENANT) are required" }, { status: 400 });
  }

  const existing = await prisma.contact.findFirst({
    where: { name: { equals: name.trim(), mode: "insensitive" }, role: role as "MANAGER" | "ACCOUNTANT" | "TENANT" },
  });
  if (existing) return Response.json(existing);

  const created = await prisma.contact.create({
    data: {
      name:        name.trim(),
      role:        role as "MANAGER" | "ACCOUNTANT" | "TENANT",
      street:      street      || null,
      houseNumber: houseNumber || null,
      postalCode:  postalCode  || null,
      city:        city        || null,
    },
  });
  return Response.json(created, { status: 201 });
}
