// src/app/api/photos/albums/route.ts
import 'server-only';
import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const API = 'https://photoslibrary.googleapis.com/v1';

export async function GET() {
  const o = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!, process.env.GOOGLE_CLIENT_SECRET!);
  o.setCredentials({ refresh_token: process.env.PHOTOS_REFRESH_TOKEN! });

  const headers = await o.getRequestHeaders();
  const res = await fetch(`${API}/albums?pageSize=50`, { headers });
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }
  const data = await res.json();

  // Copy the "id" for the album you want
  const albums = (data.albums ?? []).map((a: any) => ({
    title: a.title,
    id: a.id,                  // <-- THIS is the albumId you should use
    mediaItemsCount: a.mediaItemsCount,
    isWriteable: a.isWriteable,
  }));

  return NextResponse.json({ albums });
}
