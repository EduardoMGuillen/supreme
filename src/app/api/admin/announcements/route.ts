import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { requireSession, patchStore } from "@/lib/admin-api";
import type { Announcement } from "@/lib/types";

const schema = z.object({
  id: z.string().optional(),
  text: z.string().min(2),
  href: z.string().optional(),
  active: z.boolean().optional(),
  order: z.number().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const { readStore } = await import("@/lib/store");
  return NextResponse.json((await readStore()).announcements);
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = schema.parse(await request.json());
  const item: Announcement = {
    id: nanoid(),
    text: body.text,
    href: body.href || undefined,
    active: body.active ?? true,
    order: body.order ?? 0,
    startsAt: body.startsAt || undefined,
    endsAt: body.endsAt || undefined,
  };
  return patchStore((store) => ({
    ...store,
    announcements: [...store.announcements, item],
  }));
}

export async function PATCH(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = schema.extend({ id: z.string() }).parse(await request.json());
  return patchStore((store) => ({
    ...store,
    announcements: store.announcements.map((a) =>
      a.id === body.id
        ? {
            ...a,
            ...body,
            href: body.href || undefined,
            startsAt: body.startsAt || undefined,
            endsAt: body.endsAt || undefined,
          }
        : a,
    ),
  }));
}

export async function DELETE(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = z.object({ id: z.string() }).parse(await request.json());
  return patchStore((store) => ({
    ...store,
    announcements: store.announcements.filter((a) => a.id !== id),
  }));
}
