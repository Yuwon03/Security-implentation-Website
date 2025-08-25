// src/lib/albums.ts (server-side only imports)
import 'server-only';

export const ALBUM_MAP: Record<string, string> = {
  bedroom:      process.env.PHOTOS_ALBUM_BEDROOM!,
  livingroom:   process.env.PHOTOS_ALBUM_LIVINGROOM!,
  staircase:    process.env.PHOTOS_ALBUM_STAIRCASE!,
  hallway:      process.env.PHOTOS_ALBUM_HALLWAY!,
  tvback:       process.env.PHOTOS_ALBUM_TVBACK!,
  custom:       process.env.PHOTOS_ALBUM_CUSTOM!,
  office:       process.env.PHOTOS_ALBUM_OFFICE!,
  cinema:       process.env.PHOTOS_ALBUM_CINEMA!,
  niche:        process.env.PHOTOS_ALBUM_NICHE!,
  fireplace:    process.env.PHOTOS_ALBUM_FIREPLACE!,
  kidsroom:     process.env.PHOTOS_ALBUM_KIDSROOM!,
  flooring:     process.env.PHOTOS_ALBUM_FLOORING!,
  prayerroom:   process.env.PHOTOS_ALBUM_PRAYERROOM!,
  toilet:       process.env.PHOTOS_ALBUM_TOILET!,
  dining:       process.env.PHOTOS_ALBUM_DINING!,
};
