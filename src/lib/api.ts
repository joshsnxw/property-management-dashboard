import type { ZodType } from "zod";

export async function parseBody(
  request: Request
): Promise<{ ok: true; data: unknown } | { ok: false; response: Response }> {
  try {
    const data = await request.json();
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: Response.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
}

export function validate<T>(
  schema: ZodType<T>,
  body: unknown
): { ok: true; data: T } | { ok: false; response: Response } {
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      ok: false,
      response: Response.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      ),
    };
  }
  return { ok: true, data: result.data };
}
