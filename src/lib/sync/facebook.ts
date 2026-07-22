import type { SocialItem } from "../types";
import { fetchText, type AdapterResult } from "./types";

/**
 * Facebook Page feed via Graph API when META_ACCESS_TOKEN + FB_PAGE_ID are set.
 */
export async function syncFacebook(): Promise<AdapterResult> {
  const token = process.env.META_ACCESS_TOKEN;
  const pageId = process.env.FB_PAGE_ID;
  const profile = "https://www.facebook.com/Supremotok/";

  if (!token || !pageId) {
    return {
      platform: "facebook",
      status: "skipped",
      message:
        "Configurar META_ACCESS_TOKEN + FB_PAGE_ID (token de página gratis)",
      socialItems: [
        {
          id: "facebook:profile",
          platform: "facebook",
          title: "Facebook Supremotok",
          url: profile,
          publishedAt: new Date().toISOString(),
        },
      ],
    };
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${pageId}/posts?fields=id,message,permalink_url,created_time,full_picture&access_token=${token}`;
    const res = await fetchText(url);
    if (!res.ok) {
      return {
        platform: "facebook",
        status: "error",
        message: `Graph HTTP ${res.status}`,
      };
    }
    const data = (await res.json()) as {
      data?: Array<{
        id: string;
        message?: string;
        permalink_url?: string;
        created_time: string;
        full_picture?: string;
      }>;
    };

    const socialItems: SocialItem[] = (data.data || []).slice(0, 12).map((p) => ({
      id: `facebook:${p.id}`,
      platform: "facebook" as const,
      title: (p.message || "Publicación de Facebook").slice(0, 120),
      thumbnail: p.full_picture,
      url: p.permalink_url || profile,
      publishedAt: p.created_time,
    }));

    return {
      platform: "facebook",
      status: "ok",
      socialItems,
      message: `${socialItems.length} posts`,
    };
  } catch (err) {
    return {
      platform: "facebook",
      status: "error",
      message: err instanceof Error ? err.message : "Facebook sync failed",
    };
  }
}
