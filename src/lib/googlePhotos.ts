import 'server-only';
import { OAuth2Client } from 'google-auth-library';

const API = 'https://photoslibrary.googleapis.com/v1';

type FetchOpts = {
  albumId: string;
  pageSize?: number;
  pageToken?: string | null | undefined;
};

export async function fetchAlbumPage({ albumId, pageSize = 24, pageToken }: FetchOpts) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.PHOTOS_REFRESH_TOKEN) {
    throw new Error('Missing Google OAuth env vars');
  }

  const oauth = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth.setCredentials({ refresh_token: process.env.PHOTOS_REFRESH_TOKEN });

  // This gives us Authorization: Bearer <access_token>
  const headers = await oauth.getRequestHeaders();

  const res = await fetch(`${API}/mediaItems:search`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      albumId,
      pageSize,
      pageToken: pageToken || undefined,
    }),
    // Optional: small SSR timeout safety
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Photos API ${res.status}: ${text}`);
  }

  const data = await res.json();
  const items =
    (data.mediaItems ?? []).map((m: any) => ({
      id: m.id as string,
      baseUrl: m.baseUrl as string,
      filename: (m.filename as string) ?? '',
    })) ?? [];

  return { items, nextPageToken: (data.nextPageToken as string) ?? null };
}
