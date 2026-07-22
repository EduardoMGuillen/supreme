import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, patchStore } from "@/lib/admin-api";

const schema = z.object({
  tagline: z.string().optional(),
  contactEmail: z.string().optional(),
  youtubeChannelId: z.string().optional(),
  spotifyArtistId: z.string().optional(),
  handles: z
    .object({
      tiktok: z.string().optional(),
      youtube: z.string().optional(),
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      spotify: z.string().optional(),
    })
    .optional(),
});

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const { readStore } = await import("@/lib/store");
  return NextResponse.json((await readStore()).config);
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = schema.parse(await request.json());

  return patchStore((store) => ({
    ...store,
    config: {
      ...store.config,
      ...body,
      handles: { ...store.config.handles, ...body.handles },
    },
  }));
}
