import type { SocialItem } from "../types";
import { fetchText, type AdapterResult } from "./types";

/**
 * Best-effort TikTok sync + live check.
 * Official public APIs are limited; this may fail from cloud IPs.
 */
export async function syncTikTok(): Promise<AdapterResult> {
  const profileUrl = "https://www.tiktok.com/@supremolives";
  const liveUrl = "https://www.tiktok.com/@supremolives/live";

  try {
    const res = await fetchText(profileUrl, {
      headers: {
        "Accept-Language": "es-ES,es;q=0.9",
      },
    });

    if (!res.ok) {
      return {
        platform: "tiktok",
        status: "skipped",
        message: `Perfil HTTP ${res.status}. Usar pins manuales / toggle LIVE en admin.`,
        live: { isLive: false, url: liveUrl },
      };
    }

    const html = await res.text();
    const isLive =
      /"isLive":\s*true/.test(html) ||
      /"liveRoom"/.test(html) ||
      /live-room/.test(html);

    const socialItems: SocialItem[] = [];
    const videoMatches = [
      ...html.matchAll(
        /"id":"(\d{10,})"[^}]*?"desc":"([^"]*)"[^}]*?"cover":"([^"]*)"/g,
      ),
    ].slice(0, 8);

    for (const m of videoMatches) {
      const id = m[1];
      const title = m[2]?.replace(/\\u002F/g, "/").slice(0, 120) || "TikTok";
      const cover = m[3]
        ?.replace(/\\u002F/g, "/")
        .replace(/\\\//g, "/")
        .replace(/\\u0026/g, "&");
      socialItems.push({
        id: `tiktok:${id}`,
        platform: "tiktok",
        title,
        thumbnail: cover,
        url: `${profileUrl}/video/${id}`,
        publishedAt: new Date().toISOString(),
      });
    }

    if (socialItems.length === 0) {
      // Keep a profile card so the hub still shows TikTok
      socialItems.push({
        id: "tiktok:profile",
        platform: "tiktok",
        title: "Ver @supremolives en TikTok",
        url: profileUrl,
        publishedAt: new Date().toISOString(),
      });
    }

    return {
      platform: "tiktok",
      status: socialItems.length ? "ok" : "skipped",
      socialItems,
      live: {
        isLive,
        url: liveUrl,
        title: isLive ? "En vivo en TikTok" : undefined,
      },
      message: isLive ? "LIVE detectado" : "Offline / best-effort",
    };
  } catch (err) {
    return {
      platform: "tiktok",
      status: "skipped",
      message: err instanceof Error ? err.message : "TikTok sync unavailable",
      live: { isLive: false, url: liveUrl },
    };
  }
}
