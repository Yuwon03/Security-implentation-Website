import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { driveFolderMap } from "@/lib/driveFolders";

export async function GET(
  req: NextRequest,
  { params }: { params: { category: string } }
) {
  const category = params.category;
  const folderId = driveFolderMap[category];

  if (!folderId) {
    return NextResponse.json(
      { error: "Invalid category" },
      { status: 400 }
    );
  }

  const pageSize = 15;
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
      fields: "nextPageToken, files(id, name, webContentLink, thumbnailLink)",
      pageSize,
      pageToken,
    });

    const images = (res.data.files || []).map((file) => ({
      id: file.id!,
      name: file.name!,
      url: file.webContentLink!,
      thumbnail: file.thumbnailLink!,
    }));

    return NextResponse.json({
      images,
      nextPageToken: res.data.nextPageToken || null,
    });
  } catch (error) {
    console.error("Drive API Error:", error);
    return NextResponse.json({ error: "Failed to load images" }, { status: 500 });
  }
}
