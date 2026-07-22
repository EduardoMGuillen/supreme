import { writeStore } from "../store";
import type { SocialItem, SyncPlatformResult, Track } from "../types";
import { syncFacebook } from "./facebook";
import { syncInstagram } from "./instagram";
import { syncSpotify } from "./spotify";
import { syncTikTok } from "./tiktok";
import { syncTwitter } from "./twitter";
import { resultAt, type AdapterResult, type SyncContext } from "./types";
import { syncYouTube } from "./youtube";

function mergeSocial(
  existing: SocialItem[],
  incoming: SocialItem[],
): SocialItem[] {
  const map = new Map<string, SocialItem>();
  // Keep previously synced platforms, then overlay this adapter's items
  for (const item of existing) map.set(item.id, item);
  for (const item of incoming) {
    const prev = map.get(item.id);
    map.set(item.id, {
      ...item,
      pinned: prev?.pinned ?? item.pinned,
      hidden: prev?.hidden ?? item.hidden,
    });
  }
  return [...map.values()]
    .filter((i) => !i.hidden)
    .sort(
      (a, b) =>
        Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, 60);
}

function mergeTracks(existing: Track[], incoming: Track[]): Track[] {
  const manual = existing.filter((t) => t.source === "manual");
  const map = new Map<string, Track>();
  for (const t of incoming) map.set(t.id, t);
  for (const t of manual) map.set(t.id, t);
  // Keep featured/order overrides from existing spotify tracks
  for (const t of existing) {
    if (t.source !== "manual" && map.has(t.id)) {
      map.set(t.id, {
        ...map.get(t.id)!,
        featured: t.featured ?? map.get(t.id)!.featured,
        order: t.order ?? map.get(t.id)!.order,
        youtubeUrl: t.youtubeUrl || map.get(t.id)!.youtubeUrl,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.order - b.order);
}

export async function runSync(): Promise<{
  log: SyncPlatformResult[];
  storeUpdatedAt: string;
}> {
  const log: SyncPlatformResult[] = [];

  const storeSnapshot = await writeStore(async (store) => store);
  const ctx: SyncContext = {
    youtubeChannelId: storeSnapshot.config.youtubeChannelId,
    youtubeHandle: "SoySupremoo",
    spotifyArtistId: storeSnapshot.config.spotifyArtistId,
    handles: storeSnapshot.config.handles,
  };

  const results: AdapterResult[] = await Promise.all([
    syncYouTube(ctx),
    syncSpotify(ctx),
    syncTikTok(),
    syncInstagram(),
    syncFacebook(),
    syncTwitter(),
  ]);

  const next = await writeStore((store) => {
    let social = [...store.socialItems];
    let tracks = [...store.tracks];
    let live = { ...store.liveStatus };
    let youtubeChannelId = store.config.youtubeChannelId;

    for (const r of results) {
      log.push(
        resultAt(
          r.platform,
          r.status,
          r.message,
          r.socialItems?.length ?? r.tracks?.length,
        ),
      );

      if (r.socialItems?.length) {
        social = mergeSocial(social, r.socialItems);
      }
      if (r.tracks?.length) {
        tracks = mergeTracks(tracks, r.tracks);
      }
      if (r.platform === "youtube" && r.message) {
        const idMatch = r.message.match(/channelId=(UC[\w-]{22})/);
        if (idMatch) youtubeChannelId = idMatch[1];
      }
      if (r.live && store.liveStatus.source !== "manual") {
        live = {
          isLive: r.live.isLive,
          platform: "tiktok",
          url: r.live.url,
          title: r.live.title || "",
          updatedAt: new Date().toISOString(),
          source: "auto",
        };
      } else if (r.live && !store.liveStatus.isLive && r.live.isLive) {
        // Auto can turn ON even if last was manual off? Prefer: only update auto when source is auto
      }
      // If source is manual, keep manual live flag; still refresh URL
      if (r.live && store.liveStatus.source === "manual") {
        live = {
          ...live,
          url: r.live.url || live.url,
          updatedAt: live.updatedAt,
        };
      }
    }

    return {
      ...store,
      socialItems: social,
      tracks,
      liveStatus: live,
      config: {
        ...store.config,
        youtubeChannelId,
        lastSyncAt: new Date().toISOString(),
        syncLog: log,
      },
    };
  });

  return { log, storeUpdatedAt: next.updatedAt };
}
