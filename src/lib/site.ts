import type { StoreData } from "./types";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://soysupremohn.com";

export const DEFAULT_CONFIG: StoreData["config"] = {
  siteName: "SoySupremo",
  siteUrl: SITE_URL,
  tagline: "Humor, música y partidos. Desde Honduras para el mundo.",
  contactEmail: "soysupremohn@gmail.com",
  handles: {
    tiktok: "https://www.tiktok.com/@supremolives",
    youtube: "https://www.youtube.com/@SoySupremoo",
    instagram: "https://www.instagram.com/soysupremo_/",
    facebook: "https://www.facebook.com/Supremotok/",
    twitter: "https://x.com/soysupremo_",
    spotify: "https://open.spotify.com/intl-es/artist/38Lid4XKPqZ2hSdxHTmbit",
  },
  // Resolved at sync time from @SoySupremoo if empty
  youtubeChannelId: "",
  spotifyArtistId: "38Lid4XKPqZ2hSdxHTmbit",
  syncLog: [],
};

export const DEFAULT_LIVE: StoreData["liveStatus"] = {
  isLive: false,
  platform: "tiktok",
  url: "https://www.tiktok.com/@supremolives/live",
  title: "",
  updatedAt: new Date(0).toISOString(),
  source: "manual",
};

export function createEmptyStore(): StoreData {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    socialItems: [],
    tracks: [],
    events: [],
    posts: [],
    announcements: [],
    sponsors: [],
    liveStatus: { ...DEFAULT_LIVE },
    contactMessages: [],
    config: { ...DEFAULT_CONFIG, syncLog: [] },
  };
}

export const SOCIAL_LINKS = [
  { key: "tiktok" as const, label: "TikTok" },
  { key: "youtube" as const, label: "YouTube" },
  { key: "instagram" as const, label: "Instagram" },
  { key: "facebook" as const, label: "Facebook" },
  { key: "twitter" as const, label: "X" },
  { key: "spotify" as const, label: "Spotify" },
];

export function isAnnouncementVisible(
  a: StoreData["announcements"][number],
  now = new Date(),
): boolean {
  if (!a.active) return false;
  if (a.startsAt && new Date(a.startsAt) > now) return false;
  if (a.endsAt && new Date(a.endsAt) < now) return false;
  return true;
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
