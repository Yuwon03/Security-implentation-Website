// src/app/api/photos/[category]/route.ts
import { NextResponse } from 'next/server';
import { ALBUM_MAP } from '@/lib/albums';
import { fetchAlbumPage } from '@/lib/googlePhotos';

export async function GET(
  req: Request,
  ctx: { params: Promise<{ category: string }> }
) {
  const { category } = await ctx.params;              // ✅ await first
  const url = new URL(req.url);
  const pageToken = url.searchParams.get('pageToken');
  const pageSize  = Number(url.searchParams.get('pageSize') || 24);

  const albumId = ALBUM_MAP[category.toLowerCase()];
  if (!albumId) {
    return NextResponse.json({ error: 'Unknown category' }, { status: 404 });
  }

  const { items, nextPageToken } = await fetchAlbumPage({ albumId, pageSize, pageToken });

  const res = NextResponse.json({ items, nextPageToken });
  res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}
