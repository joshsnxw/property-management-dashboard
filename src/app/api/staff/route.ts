import { prisma } from "@/lib/prisma";

export async function GET() {
  const staff = await prisma.staff.findMany({ orderBy: { name: "asc" } });
  return Response.json(staff);
}
