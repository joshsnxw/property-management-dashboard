import { prisma } from "@/lib/prisma";
import { CreatePropertySchema } from "@/lib/validations/property";

async function generateNumber(type: "WEG" | "MV"): Promise<string> {
  const existing = await prisma.property.findMany({
    where: { number: { startsWith: type + "-" } },
    select: { number: true },
  });
  const nums = existing
    .map((p) => parseInt(p.number.split("-")[1] ?? "0", 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${type}-${String(next).padStart(3, "0")}`;
}

export async function GET() {
  const properties = await prisma.property.findMany({
    include: {
      manager: true,
      _count: { select: { buildings: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(properties);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = CreatePropertySchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: "Validation failed", fields: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = result.data;
  const number = data.number?.trim() || (await generateNumber(data.type));

  // Derive address from first building if not provided
  const firstBuilding = data.buildings[0];
  const address =
    data.address ||
    `${firstBuilding.street} ${firstBuilding.houseNumber}, ${firstBuilding.postalCode} ${firstBuilding.city}`;

  try {
    const property = await prisma.$transaction(async (tx) => {
      const created = await tx.property.create({
        data: {
          name:        data.name,
          address,
          number,
          type:        data.type,
          managerId:   data.managerId,
          accountantId:data.accountantId,
          buildings: {
            create: data.buildings.map((b, idx) => ({
              label:       b.label,
              street:      b.street,
              houseNumber: b.houseNumber,
              postalCode:  b.postalCode,
              city:        b.city,
              yearBuilt:   b.yearBuilt,
              floors:      b.floors,
              units: {
                create: data.units
                  .filter((u) => u.buildingIndex === idx)
                  .map((u) => ({
                    number:          u.number,
                    type:            u.type,
                    floor:           u.floor,
                    entrance:        u.entrance,
                    sizeSqm:         u.sizeSqm,
                    coOwnershipShare:u.coOwnershipShare,
                    yearBuilt:       u.yearBuilt,
                    rooms:           u.rooms,
                  })),
              },
            })),
          },
        },
        include: { manager: true, accountant: true },
      });
      return created;
    });

    return Response.json(property, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("Unique constraint")) {
      return Response.json(
        { error: "A property with that number already exists." },
        { status: 409 }
      );
    }
    return Response.json({ error: "Failed to create property" }, { status: 500 });
  }
}
