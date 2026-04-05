import { getDownloadUrl } from "@vercel/blob";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) return Response.json({ error: "Missing url" }, { status: 400 });

  try {
    const downloadUrl = await getDownloadUrl(url);
    return Response.redirect(downloadUrl, 302);
  } catch (err) {
    console.error("Download error:", err);
    return Response.json({ error: "Failed to get download URL" }, { status: 500 });
  }
}
