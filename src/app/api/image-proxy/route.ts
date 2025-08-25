import { google } from "googleapis";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const fileId = req.nextUrl.searchParams.get("id");

  if (!fileId) {
    return new Response("Missing file ID", { status: 400 });
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

    const result = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    const stream = result.data;

    // Optional: set image headers for caching and content type
    const headers = new Headers({
      "Content-Type": result.headers["content-type"] || "image/jpeg",
      "Cache-Control": "public, max-age=86400", // 1 day cache
    });

    return new Response(stream as any, { status: 200, headers });
  } catch (err) {
    console.error("Image Proxy Error:", err);
    return new Response("Failed to load image", { status: 500 });
  }
}
