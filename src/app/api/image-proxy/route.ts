import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";       // <-- ensure Node runtime
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    const drive = google.drive({ version: "v3", auth });

    // 1) metadata (for mime + etag)
    const meta = await drive.files.get({
      fileId: id,
      fields: "id, name, mimeType, md5Checksum, modifiedTime, size",
    });

    const mime = meta.data.mimeType || "application/octet-stream";
    const etag = meta.data.md5Checksum || undefined;

    // 2) client cache validation
    const ifNoneMatch = req.headers.get("if-none-match") || undefined;
    if (etag && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
          "Content-Type": mime,
        },
      });
    }

    // 3) download bytes as ArrayBuffer (NOT Buffer)
    const fileRes = await drive.files.get(
      { fileId: id, alt: "media" },
      { responseType: "arraybuffer" }
    );

    // `fileRes.data` is already an ArrayBuffer
    const arr = fileRes.data as ArrayBuffer;
    // If your TS/lib complains, you can also wrap it:
    // const body = new Uint8Array(arr);

    return new NextResponse(arr, {
      headers: {
        "Content-Type": mime,
        "Content-Length": String((arr as ArrayBuffer).byteLength),
        "Content-Disposition": `inline; filename="${encodeURIComponent(meta.data.name || id)}"`,
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        ...(etag ? { ETag: etag } : {}),
        ...(meta.data.modifiedTime
          ? { "Last-Modified": new Date(meta.data.modifiedTime).toUTCString() }
          : {}),
      },
    });
  } catch (err) {
    console.error("Drive API Error (proxy):", err);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
