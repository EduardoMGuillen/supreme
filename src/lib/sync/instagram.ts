import type { SocialItem } from "../types";
import { fetchText, type AdapterResult } from "./types";

/**
 * Instagram Graph API when META_ACCESS_TOKEN + IG_USER_ID are set.
 * Otherwise skipped — ready to activate (see Pending Updates.txt).
 */
export async function syncInstagram(): Promise<AdapterResult> {
  const token = process.env.META_ACCESS_TOKEN;
  const igUserId = process.env.IG_USER_ID;
  const profile = "https://www.instagram.com/soysupremo_/";

  if (!token || !igUserId) {
    return {
      platform: "instagram",
      status: "skipped",
      message:
        "Configurar META_ACCESS_TOKEN + IG_USER_ID (Graph API gratis con cuenta Business)",
      socialItems: [
        {
          id: "instagram:profile",
          platform: "instagram",
          title: "Instagram @soysupremo_",
          url: profile,
          publishedAt: new Date().toISOString(),
        },
      ],
    };
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${igUserId}/media?fields=id,caption,media_url,permalink,thumbnail_url,timestamp,media_type&access_token=${token}`;
    const res = await fetchText(url);
    if (!res.ok) {
      return {
        platform: "instagram",
        status: "error",
        message: `Graph HTTP ${res.status}`,
      };
    }
    const data = (await res.json()) as {
      data?: Array<{
        id: string;
        caption?: string;
        media_url?: string;
        thumbnail_url?: string;
        permalink: string;
        timestamp: string;
      }>;
    };

    const socialItems: SocialItem[] = (data.data || []).slice(0, 12).map((p) => ({
      id: `instagram:${p.id}`,
      platform: "instagram" as const,
      title: (p.caption || "Publicación de Instagram").slice(0, 120),
      thumbnail: p.thumbnail_url || p.media_url,
      url: p.permalink,
      publishedAt: p.timestamp,
    }));

    return {
      platform: "instagram",
      status: "ok",
      socialItems,
      message: `${socialItems.length} posts`,
    };
  } catch (err) {
    return {
      platform: "instagram",
      status: "error",
      message: err instanceof Error ? err.message : "Instagram sync failed",
    };
  }
}
