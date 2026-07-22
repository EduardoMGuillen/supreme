import { NextResponse } from "next/server";
import { storageMode } from "@/lib/store";
import { readStore } from "@/lib/store";

export async function GET() {
  const store = await readStore();
  const lastSync = store.config.lastSyncAt || null;
  const stale =
    !lastSync ||
    Date.now() - new Date(lastSync).getTime() > 1000 * 60 * 60 * 6;

  return NextResponse.json({
    ok: true,
    storage: storageMode() === "supabase" ? "supabase" : "file-or-memory",
    lastSync,
    syncStale: stale,
    cronConfigured: Boolean(process.env.CRON_SECRET),
    live: store.liveStatus.isLive,
    tracks: store.tracks.length,
    spotify: store.config.syncLog.find((l) => l.platform === "spotify") || null,
    spotifyEnv: Boolean(
      process.env.SPOTIFY_CLIENT_ID?.trim() &&
        process.env.SPOTIFY_CLIENT_SECRET?.trim(),
    ),
    updatedAt: store.updatedAt,
  });
}
