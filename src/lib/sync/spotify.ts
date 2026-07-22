import type { Track } from "../types";
import { fetchText, type AdapterResult, type SyncContext } from "./types";

async function getAccessToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;

  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetchText("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token || null;
}

export async function syncSpotify(ctx: SyncContext): Promise<AdapterResult> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return {
        platform: "spotify",
        status: "skipped",
        message:
          "Faltan SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET (gratis en Spotify Developer)",
      };
    }

    const artistId = ctx.spotifyArtistId;
    const topRes = await fetchText(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=HN`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!topRes.ok) {
      return {
        platform: "spotify",
        status: "error",
        message: `Spotify top-tracks HTTP ${topRes.status}`,
      };
    }

    const top = (await topRes.json()) as {
      tracks?: Array<{
        id: string;
        name: string;
        preview_url: string | null;
        external_urls?: { spotify?: string };
        artists?: Array<{ name: string }>;
        album?: { images?: Array<{ url: string }> };
      }>;
    };

    const tracks: Track[] = (top.tracks || []).slice(0, 12).map((t, index) => ({
      id: `spotify:${t.id}`,
      title: t.name,
      artists: t.artists?.map((a) => a.name).join(", "),
      cover: t.album?.images?.[0]?.url,
      previewUrl: t.preview_url || undefined,
      spotifyUrl: t.external_urls?.spotify,
      featured: index < 4,
      order: index,
      source: "spotify" as const,
    }));

    return {
      platform: "spotify",
      status: "ok",
      tracks,
      message: `${tracks.length} tracks`,
    };
  } catch (err) {
    return {
      platform: "spotify",
      status: "error",
      message: err instanceof Error ? err.message : "Spotify sync failed",
    };
  }
}
