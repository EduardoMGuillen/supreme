import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { requireSession, patchStore } from "@/lib/admin-api";
import { slugify } from "@/lib/site";
import type { SiteEvent } from "@/lib/types";

const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  slug: z.string().optional(),
  date: z.string(),
  venue: z.string().optional(),
  city: z.string().optional(),
  type: z.enum(["concierto", "partido", "live", "otro"]),
  ticketUrl: z.string().optional(),
  infoUrl: z.string().optional(),
  cover: z.string().optional(),
  description: z.string().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const { readStore } = await import("@/lib/store");
  return NextResponse.json((await readStore()).events);
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = schema.parse(await request.json());
  const event: SiteEvent = {
    id: nanoid(),
    slug: body.slug || slugify(body.title),
    title: body.title,
    date: body.date,
    venue: body.venue,
    city: body.city,
    type: body.type,
    ticketUrl: body.ticketUrl || undefined,
    infoUrl: body.infoUrl || undefined,
    cover: body.cover || undefined,
    description: body.description,
    featured: body.featured ?? false,
    published: body.published ?? true,
  };
  return patchStore((store) => ({
    ...store,
    events: [event, ...store.events],
  }));
}

export async function PATCH(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = schema.extend({ id: z.string() }).parse(await request.json());
  return patchStore((store) => ({
    ...store,
    events: store.events.map((e) =>
      e.id === body.id
        ? {
            ...e,
            ...body,
            slug: body.slug || e.slug,
            ticketUrl: body.ticketUrl || undefined,
            infoUrl: body.infoUrl || undefined,
            cover: body.cover || undefined,
          }
        : e,
    ),
  }));
}

export async function DELETE(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = z.object({ id: z.string() }).parse(await request.json());
  return patchStore((store) => ({
    ...store,
    events: store.events.filter((e) => e.id !== id),
  }));
}
