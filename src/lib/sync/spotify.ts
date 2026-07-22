import type { Track } from "../types";
import { fetchText, type AdapterResult, type SyncContext } from "./types";

type SpotifyTrack = {
  id: string;
  name: string;
  preview_url: string | null;
  external_urls?: { spotify?: string };
  artists?: Array<{ name: string }>;
  album?: { images?: Array<{ url: string }> };
};

const MARKETS = ["HN", "MX", "US", "ES"] as const;

async function getAccessToken(): Promise<{ token: string | null; detail?: string }> {
  const id = process.env.SPOTIFY_CLIENT_ID?.trim();
  const secret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  if (!id || !secret) {
    return {
      token: null,
      detail:
        "Faltan SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET (gratis en Spotify Developer)",
    };
  }

  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetchText("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    return {
      token: null,
      detail: `Spotify token HTTP ${res.status} (revisa Client ID/Secret en Vercel Production)`,
    };
  }
  const data = (await res.json()) as { access_token?: string };
  return { token: data.access_token || null, detail: data.access_token ? undefined : "Token vacío" };
}

function mapTracks(items: SpotifyTrack[]): Track[] {
  return items.slice(0, 12).map((t, index) => ({
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
}

async function fetchTopTracks(
  token: string,
  artistId: string,
): Promise<{ tracks: SpotifyTrack[]; market: string; status: number }> {
  for (const market of MARKETS) {
    const topRes = await fetchText(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!topRes.ok) {
      if (market === MARKETS[MARKETS.length - 1]) {
        return { tracks: [], market, status: topRes.status };
      }
      continue;
    }
    const top = (await topRes.json()) as { tracks?: SpotifyTrack[] };
    const tracks = top.tracks || [];
    if (tracks.length) return { tracks, market, status: 200 };
  }
  return { tracks: [], market: MARKETS[0], status: 200 };
}

async function fetchAlbumTracks(
  token: string,
  artistId: string,
): Promise<SpotifyTrack[]> {
  const albumsRes = await fetchText(
    `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=single,album&limit=10&market=US`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!albumsRes.ok) return [];

  const albums = (await albumsRes.json()) as {
    items?: Array<{ id: string }>;
  };
  const albumIds = [...new Set((albums.items || []).map((a) => a.id))].slice(0, 5);
  const collected: SpotifyTrack[] = [];
  const seen = new Set<string>();

  for (const albumId of albumIds) {
    const albumRes = await fetchText(
      `https://api.spotify.com/v1/albums/${albumId}?market=US`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!albumRes.ok) continue;
    const album = (await albumRes.json()) as {
      images?: Array<{ url: string }>;
      tracks?: {
        items?: Array<{
          id: string;
          name: string;
          preview_url: string | null;
          external_urls?: { spotify?: string };
          artists?: Array<{ name: string }>;
        }>;
      };
    };
    for (const t of album.tracks?.items || []) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      collected.push({
        ...t,
        album: { images: album.images },
      });
      if (collected.length >= 12) return collected;
    }
  }

  return collected;
}

export async function syncSpotify(ctx: SyncContext): Promise<AdapterResult> {
  try {
    const { token, detail } = await getAccessToken();
    if (!token) {
      return {
        platform: "spotify",
        status: "skipped",
        message: detail || "Sin token Spotify",
      };
    }

    const artistId = ctx.spotifyArtistId?.trim();
    if (!artistId) {
      return {
        platform: "spotify",
        status: "error",
        message: "Falta spotifyArtistId en config",
      };
    }

    const top = await fetchTopTracks(token, artistId);
    if (top.status !== 200 && !top.tracks.length) {
      return {
        platform: "spotify",
        status: "error",
        message: `Spotify top-tracks HTTP ${top.status}`,
      };
    }

    let source = `top-tracks:${top.market}`;
    let items = top.tracks;
    if (!items.length) {
      items = await fetchAlbumTracks(token, artistId);
      source = "albums";
    }

    const tracks = mapTracks(items);
    return {
      platform: "spotify",
      status: tracks.length ? "ok" : "error",
      tracks,
      message: tracks.length
        ? `${tracks.length} tracks (${source})`
        : `0 tracks para artist ${artistId} (top + albums)`,
    };
  } catch (err) {
    return {
      platform: "spotify",
      status: "error",
      message: err instanceof Error ? err.message : "Spotify sync failed",
    };
  }
}
