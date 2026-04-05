import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const blob = await put(file.name, file, { access: "public", addRandomSuffix: true });
    return Response.json({ url: blob.url, name: file.name, sizeBytes: file.size });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
