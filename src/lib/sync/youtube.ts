import { XMLParser } from "fast-xml-parser";
import type { SocialItem } from "../types";
import { fetchText, type AdapterResult, type SyncContext } from "./types";

async function resolveChannelId(handle: string): Promise<string | null> {
  const clean = handle.replace(/^@/, "");
  try {
    const res = await fetchText(`https://www.youtube.com/@${clean}`);
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

export async function syncYouTube(ctx: SyncContext): Promise<AdapterResult> {
  try {
    let channelId = ctx.youtubeChannelId;
    if (!channelId) {
      channelId = (await resolveChannelId("SoySupremoo")) || undefined;
    }
    if (!channelId) {
      return {
        platform: "youtube",
        status: "error",
        message: "No se pudo resolver el channelId de @SoySupremoo",
      };
    }

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await fetchText(feedUrl);
    if (!res.ok) {
      return {
        platform: "youtube",
        status: "error",
        message: `RSS HTTP ${res.status}`,
      };
    }

    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const parsed = parser.parse(xml);
    const entries = parsed?.feed?.entry;
    const list = Array.isArray(entries) ? entries : entries ? [entries] : [];

    const socialItems: SocialItem[] = list.slice(0, 15).map((entry: Record<string, unknown>) => {
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

    return {
      platform: "youtube",
      status: "ok",
      message: `channelId=${channelId}`,
      socialItems,
    };
  } catch (err) {
    return {
      platform: "youtube",
      status: "error",
      message: err instanceof Error ? err.message : "YouTube sync failed",
    };
  }
}
