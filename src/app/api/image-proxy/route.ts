import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Basic accept -> output format negotiation
function pickFormat(acceptHeader?: string) {
  const a = acceptHeader || "";
  if (a.includes("image/avif")) return "avif" as const;
  if (a.includes("image/webp")) return "webp" as const;
  return "jpeg" as const;
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Preview resizing: pass &w=2000 for grid. Omit &w for full-res.
  const w = parseInt(req.nextUrl.searchParams.get("w") || "", 10);
  const h = parseInt(req.nextUrl.searchParams.get("h") || "", 10);
  const wantResize = Number.isFinite(w) || Number.isFinite(h);

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    const drive = google.drive({ version: "v3", auth });

    // 1) Metadata for mime + etag base
    const meta = await drive.files.get({
      fileId: id,
      fields: "id,name,mimeType,md5Checksum,modifiedTime,size",
    });

    const accept = req.headers.get("accept") || "";
    const outFmt = pickFormat(accept);
    const baseMd5 = meta.data.md5Checksum || "no-md5";
    const resizeTag = `${Number.isFinite(w) ? w : 0}x${Number.isFinite(h) ? h : 0}`;
    const etag = `${baseMd5}:${resizeTag}:${outFmt}`;

    // 2) Client cache check
    if ((req.headers.get("if-none-match") || "") === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "public, s-maxage=2592000, immutable", // 30 days at edge
          Vary: "Accept",
        },
      });
    }

    // 3) Download original bytes
    const fileRes = await drive.files.get(
      { fileId: id, alt: "media" },
      { responseType: "arraybuffer" }
    );
    let buf = Buffer.from(fileRes.data as ArrayBuffer);

    // 4) Optional resize + encode to modern format for previews
    if (wantResize) {
      let pipeline = sharp(buf).rotate(); // auto-orient based on EXIF
      pipeline = pipeline.resize({
        width: Number.isFinite(w) ? w : undefined,
        height: Number.isFinite(h) ? h : undefined,
        fit: "inside",
        withoutEnlargement: true,
        fastShrinkOnLoad: true,
      });
      if (outFmt === "avif") pipeline = pipeline.avif({ quality: 62 });
      else if (outFmt === "webp") pipeline = pipeline.webp({ quality: 72 });
      else pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
      buf = await pipeline.toBuffer();
    } else {
      // No resize: serve original encoding as-is for modal/full view.
      // (You could still transcode to AVIF/WEBP if you wanted.)
    }

    const outType =
      wantResize
        ? (outFmt === "avif" ? "image/avif" : outFmt === "webp" ? "image/webp" : "image/jpeg")
        : (meta.data.mimeType || "application/octet-stream");

    // NextResponse prefers web body types; use Uint8Array for safety.
    const body = new Uint8Array(buf);

    return new NextResponse(body, {
      headers: {
        "Content-Type": outType,
        "Content-Length": String(body.byteLength),
        "Content-Disposition": `inline; filename="${encodeURIComponent(meta.data.name || id)}"`,
        "Cache-Control": "public, s-maxage=2592000, immutable",
        "ETag": etag,
        ...(meta.data.modifiedTime
          ? { "Last-Modified": new Date(meta.data.modifiedTime).toUTCString() }
          : {}),
        Vary: "Accept",
      },
    });
  } catch (err) {
    console.error("Drive API Error (proxy):", err);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
