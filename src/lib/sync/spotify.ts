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
  return {
    token: data.access_token || null,
    detail: data.access_token ? undefined : "Token vacío",
  };
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
  let lastStatus = 0;
  for (const market of MARKETS) {
    const topRes = await fetchText(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    lastStatus = topRes.status;
    if (!topRes.ok) continue;
    const top = (await topRes.json()) as { tracks?: SpotifyTrack[] };
    const tracks = top.tracks || [];
    if (tracks.length) return { tracks, market, status: 200 };
  }
  return { tracks: [], market: MARKETS[0], status: lastStatus || 200 };
}

/** Public embed page works even when Web API returns 403 for new apps. */
async function fetchEmbedTracks(artistId: string): Promise<SpotifyTrack[]> {
  const res = await fetchText(
    `https://open.spotify.com/embed/artist/${artistId}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SupremoBot/1.0; +https://soysupremohn.com)",
        Accept: "text/html",
      },
    },
  );
  if (!res.ok) return [];

  const html = await res.text();
  const start = html.indexOf('<script id="__NEXT_DATA__" type="application/json">');
  const end = html.indexOf("</script>", start);
  if (start < 0 || end < 0) return [];

  let data: unknown;
  try {
    data = JSON.parse(
      html.slice(
        start + '<script id="__NEXT_DATA__" type="application/json">'.length,
        end,
      ),
    );
  } catch {
    return [];
  }

  const entity = (
    data as {
      props?: {
        pageProps?: {
          state?: {
            data?: {
              entity?: {
                visualIdentity?: { image?: Array<{ url?: string }> };
                coverArt?: { sources?: Array<{ url?: string }> };
                trackList?: Array<{
                  uri?: string;
                  title?: string;
                  subtitle?: string;
                  audioPreview?: { url?: string };
                }>;
              };
            };
          };
        };
      };
    }
  ).props?.pageProps?.state?.data?.entity;

  if (!entity?.trackList?.length) return [];

  const cover =
    entity.visualIdentity?.image?.[0]?.url ||
    entity.coverArt?.sources?.[0]?.url ||
    undefined;

  return entity.trackList
    .map((t) => {
      const id = t.uri?.replace("spotify:track:", "") || "";
      if (!id || !t.title) return null;
      const artists = (t.subtitle || "")
        .split(/[,·•]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name }));
      return {
        id,
        name: t.title,
        preview_url: t.audioPreview?.url || null,
        external_urls: { spotify: `https://open.spotify.com/track/${id}` },
        artists,
        album: cover ? { images: [{ url: cover }] } : undefined,
      } satisfies SpotifyTrack;
    })
    .filter((t): t is SpotifyTrack => Boolean(t));
}

export async function syncSpotify(ctx: SyncContext): Promise<AdapterResult> {
  try {
    const artistId = ctx.spotifyArtistId?.trim();
    if (!artistId) {
      return {
        platform: "spotify",
        status: "error",
        message: "Falta spotifyArtistId en config",
      };
    }

    const { token, detail } = await getAccessToken();
    let source = "embed";
    let items: SpotifyTrack[] = [];
    let apiNote = "";

    if (token) {
      const top = await fetchTopTracks(token, artistId);
      if (top.tracks.length) {
        items = top.tracks;
        source = `top-tracks:${top.market}`;
      } else if (top.status === 403) {
        apiNote = "API 403 (app en development / sin extended access); ";
      } else if (top.status && top.status !== 200) {
        apiNote = `API HTTP ${top.status}; `;
      }
    } else {
      apiNote = `${detail || "Sin token"}; `;
    }

    if (!items.length) {
      items = await fetchEmbedTracks(artistId);
      source = "embed";
    }

    const tracks = mapTracks(items);
    return {
      platform: "spotify",
      status: tracks.length ? "ok" : "error",
      tracks,
      message: tracks.length
        ? `${apiNote}${tracks.length} tracks (${source})`.trim()
        : `${apiNote}0 tracks para artist ${artistId}`,
    };
  } catch (err) {
    return {
      platform: "spotify",
      status: "error",
      message: err instanceof Error ? err.message : "Spotify sync failed",
    };
  }
}
