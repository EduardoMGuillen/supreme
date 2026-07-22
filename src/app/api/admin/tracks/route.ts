import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { requireSession, patchStore } from "@/lib/admin-api";
import type { Track } from "@/lib/types";

const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  artists: z.string().optional(),
  cover: z.string().optional(),
  previewUrl: z.string().optional(),
  spotifyUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  featured: z.boolean().optional(),
  order: z.number().optional(),
});

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const { readStore } = await import("@/lib/store");
  return NextResponse.json((await readStore()).tracks);
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = schema.parse(await request.json());
  const track: Track = {
    id: body.id || `manual:${nanoid()}`,
    title: body.title,
    artists: body.artists,
    cover: body.cover || undefined,
    previewUrl: body.previewUrl || undefined,
    spotifyUrl: body.spotifyUrl || undefined,
    youtubeUrl: body.youtubeUrl || undefined,
    featured: body.featured ?? false,
    order: body.order ?? 999,
    source: "manual",
  };
  return patchStore((store) => ({
    ...store,
    tracks: [...store.tracks, track].sort((a, b) => a.order - b.order),
  }));
}

export async function PATCH(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = schema.extend({ id: z.string() }).parse(await request.json());
  return patchStore((store) => ({
    ...store,
    tracks: store.tracks
      .map((t) => (t.id === body.id ? { ...t, ...body } : t))
      .sort((a, b) => a.order - b.order),
  }));
}

export async function DELETE(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = z.object({ id: z.string() }).parse(await request.json());
  return patchStore((store) => ({
    ...store,
    tracks: store.tracks.filter((t) => t.id !== id),
  }));
}
