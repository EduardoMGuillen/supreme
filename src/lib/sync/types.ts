import type { Platform, SocialItem, SyncPlatformResult, Track } from "../types";

export type SyncContext = {
  youtubeChannelId?: string;
  youtubeHandle: string;
  spotifyArtistId: string;
  handles: {
    tiktok: string;
    youtube: string;
    instagram: string;
    facebook: string;
    twitter: string;
    spotify: string;
  };
};

export type AdapterResult = {
  platform: Platform;
  status: "ok" | "skipped" | "error";
  message?: string;
  socialItems?: SocialItem[];
  tracks?: Track[];
  live?: { isLive: boolean; url: string; title?: string };
};

export function resultAt(
  platform: Platform,
  status: SyncPlatformResult["status"],
  message?: string,
  count?: number,
): SyncPlatformResult {
  return {
    platform,
    status,
    message,
    count,
    at: new Date().toISOString(),
  };
}

export async function fetchText(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; SoySupremoBot/1.0; +https://soysupremohn.com)",
      Accept: "application/json, text/html, application/xml, */*",
      ...(init?.headers || {}),
    },
    next: { revalidate: 0 },
  });
}
