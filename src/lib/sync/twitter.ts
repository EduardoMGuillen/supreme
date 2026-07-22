import type { SocialItem } from "../types";
import { fetchText, type AdapterResult } from "./types";

/**
 * X/Twitter official API requires a paid plan.
 * Adapter is ready: set X_BEARER_TOKEN to activate.
 */
export async function syncTwitter(): Promise<AdapterResult> {
  const bearer = process.env.X_BEARER_TOKEN;
  const userId = process.env.X_USER_ID;
  const profile = "https://x.com/soysupremo_";

  if (!bearer || !userId) {
    return {
      platform: "twitter",
      status: "skipped",
      message:
        "API de X requiere plan de pago. Configurar X_BEARER_TOKEN + X_USER_ID",
      socialItems: [
        {
          id: "twitter:profile",
          platform: "twitter",
          title: "X @soysupremo_",
          url: profile,
          publishedAt: new Date().toISOString(),
        },
      ],
    };
  }

  try {
    const url = `https://api.x.com/2/users/${userId}/tweets?max_results=10&tweet.fields=created_at,attachments&expansions=attachments.media_keys&media.fields=preview_image_url,url`;
    const res = await fetchText(url, {
      headers: { Authorization: `Bearer ${bearer}` },
    });
    if (!res.ok) {
      return {
        platform: "twitter",
        status: "error",
        message: `X API HTTP ${res.status}`,
      };
    }
    const data = (await res.json()) as {
      data?: Array<{ id: string; text: string; created_at: string }>;
    };

    const socialItems: SocialItem[] = (data.data || []).map((t) => ({
      id: `twitter:${t.id}`,
      platform: "twitter" as const,
      title: t.text.slice(0, 120),
      url: `https://x.com/soysupremo_/status/${t.id}`,
      publishedAt: t.created_at,
    }));

    return {
      platform: "twitter",
      status: "ok",
      socialItems,
      message: `${socialItems.length} tweets`,
    };
  } catch (err) {
    return {
      platform: "twitter",
      status: "error",
      message: err instanceof Error ? err.message : "X sync failed",
    };
  }
}
