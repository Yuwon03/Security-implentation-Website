import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { driveFolderMap } from "@/lib/driveFolders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ category: string }> } // 👈 params is a Promise
) {
  const { category } = await ctx.params;        // 👈 await it
  const folderId = driveFolderMap[category];

  if (!folderId) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const pageSize = 100;
  const pageToken = req.nextUrl.searchParams.get("pageToken") || undefined;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType, createdTime)",
      pageSize,
      pageToken,
      orderBy: "createdTime desc, name_natural",
    });

    const images = (res.data.files || []).map((f) => ({
      id: f.id!,
      name: f.name!,
      mimeType: f.mimeType || "image/jpeg",
      // createdTime: f.createdTime, // keep if you want to show it in UI/debug
    }));

    return NextResponse.json(
      { images, nextPageToken: res.data.nextPageToken || null },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch (error) {
    console.error("Drive API Error (list):", error);
    return NextResponse.json({ error: "Failed to load images" }, { status: 500 });
  }
}
