import { z } from "zod";
import { requireSession, patchStore } from "@/lib/admin-api";

const schema = z.object({
  isLive: z.boolean(),
  url: z.string().optional(),
  title: z.string().optional(),
  platform: z.enum(["tiktok", "youtube", "instagram", "other"]).optional(),
});

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = schema.parse(await request.json());

  return patchStore((store) => ({
    ...store,
    liveStatus: {
      isLive: body.isLive,
      url: body.url || store.liveStatus.url,
      title: body.title ?? store.liveStatus.title,
      platform: body.platform || store.liveStatus.platform,
      updatedAt: new Date().toISOString(),
      source: "manual",
    },
  }));
}
