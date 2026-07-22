import { XMLParser } from "fast-xml-parser";
import type { SocialItem } from "../types";
import { fetchText, type AdapterResult, type SyncContext } from "./types";

async function resolveChannelId(handle: string): Promise<string | null> {
  const clean = handle.replace(/^@/, "");
  try {
    const res = await fetchText(`https://www.youtube.com/@${clean}/videos`);
    if (!res.ok) return null;
    const html = await res.text();
    const match =
      html.match(/"channelId":"(UC[\w-]{22})"/) ||
      html.match(/\/channel\/(UC[\w-]{22})/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function parseRss(xml: string): SocialItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const parsed = parser.parse(xml);
  const entries = parsed?.feed?.entry;
  const list = Array.isArray(entries) ? entries : entries ? [entries] : [];

  return list.slice(0, 15).map((entry: Record<string, unknown>) => {
    const videoId =
      (entry["yt:videoId"] as string) ||
      String(entry.id || "").replace("yt:video:", "");
    const media = entry["media:group"] as Record<string, unknown> | undefined;
    const thumb =
      (media?.["media:thumbnail"] as { "@_url"?: string } | undefined)?.[
        "@_url"
      ] || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    return {
      id: `youtube:${videoId}`,
      platform: "youtube" as const,
      title: String(entry.title || "Video de YouTube"),
      thumbnail: thumb,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      publishedAt: String(entry.published || new Date().toISOString()),
    };
  });
}

async function fetchRss(url: string): Promise<SocialItem[] | null> {
  const res = await fetchText(url);
  if (!res.ok) return null;
  const xml = await res.text();
  if (!xml.includes("<entry") && !xml.includes("<feed")) return null;
  const items = parseRss(xml);
  return items.length ? items : null;
}

/** Fallback: scrape /videos page for recent video ids, enrich titles via oEmbed. */
async function scrapeChannelVideos(handle: string): Promise<SocialItem[]> {
  const clean = handle.replace(/^@/, "");
  const res = await fetchText(`https://www.youtube.com/@${clean}/videos`);
  if (!res.ok) return [];
  const html = await res.text();

  const seen = new Set<string>();
  const videoIds: string[] = [];

  for (const m of html.matchAll(/"videoId":"([\w-]{11})"/g)) {
    const id = m[1];
    if (seen.has(id)) continue;
    seen.add(id);
    videoIds.push(id);
    if (videoIds.length >= 12) break;
  }

  if (!videoIds.length) {
    for (const m of html.matchAll(/watch\?v=([\w-]{11})/g)) {
      const id = m[1];
      if (seen.has(id)) continue;
      seen.add(id);
      videoIds.push(id);
      if (videoIds.length >= 12) break;
    }
  }

  const items: SocialItem[] = [];
  for (const videoId of videoIds) {
    let title = "Video de YouTube";
    try {
      const oembed = await fetchText(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(
          `https://www.youtube.com/watch?v=${videoId}`,
        )}&format=json`,
      );
      if (oembed.ok) {
        const data = (await oembed.json()) as { title?: string };
        if (data.title) title = data.title;
      }
    } catch {
      // keep fallback title
    }
    items.push({
      id: `youtube:${videoId}`,
      platform: "youtube",
      title,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      publishedAt: new Date().toISOString(),
    });
  }

  return items;
}

export async function syncYouTube(ctx: SyncContext): Promise<AdapterResult> {
  try {
    let channelId = ctx.youtubeChannelId;
    if (!channelId) {
      channelId = (await resolveChannelId("SoySupremoo")) || undefined;
    }
    if (!channelId) {
      channelId = "UCfy7Ubh9Ciy82CKxgyYtxIA";
    }

    const uploadsPlaylistId = `UU${channelId.slice(2)}`;

    const fromChannelRss = await fetchRss(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    );
    if (fromChannelRss?.length) {
      return {
        platform: "youtube",
        status: "ok",
        message: `channelId=${channelId}`,
        socialItems: fromChannelRss,
      };
    }

    const fromPlaylistRss = await fetchRss(
      `https://www.youtube.com/feeds/videos.xml?playlist_id=${uploadsPlaylistId}`,
    );
    if (fromPlaylistRss?.length) {
      return {
        platform: "youtube",
        status: "ok",
        message: `channelId=${channelId};source=playlist-rss`,
        socialItems: fromPlaylistRss,
      };
    }

    const scraped = await scrapeChannelVideos("SoySupremoo");
    if (scraped.length) {
      return {
        platform: "youtube",
        status: "ok",
        message: `channelId=${channelId};source=scrape`,
        socialItems: scraped,
      };
    }

    return {
      platform: "youtube",
      status: "error",
      message: "RSS y scrape de YouTube fallaron. Reintentar sync más tarde.",
      socialItems: [
        {
          id: "youtube:channel",
          platform: "youtube",
          title: "Canal SoySupremo en YouTube",
          url: "https://www.youtube.com/@SoySupremoo",
          publishedAt: new Date().toISOString(),
        },
      ],
    };
  } catch (err) {
    return {
      platform: "youtube",
      status: "error",
      message: err instanceof Error ? err.message : "YouTube sync failed",
    };
  }
}
