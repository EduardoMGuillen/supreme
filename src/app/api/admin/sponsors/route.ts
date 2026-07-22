import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { requireSession, patchStore } from "@/lib/admin-api";
import type { Sponsor } from "@/lib/types";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  logoUrl: z.string().min(1),
  href: z.string().optional(),
  type: z.enum(["patrocinador", "colaboracion"]),
  active: z.boolean().optional(),
  order: z.number().optional(),
});

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const { readStore } = await import("@/lib/store");
  return NextResponse.json((await readStore()).sponsors);
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = schema.parse(await request.json());
  const item: Sponsor = {
    id: nanoid(),
    name: body.name,
    logoUrl: body.logoUrl,
    href: body.href || undefined,
    type: body.type,
    active: body.active ?? true,
    order: body.order ?? 0,
  };
  return patchStore((store) => ({
    ...store,
    sponsors: [...store.sponsors, item],
  }));
}

export async function PATCH(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = schema.extend({ id: z.string() }).parse(await request.json());
  return patchStore((store) => ({
    ...store,
    sponsors: store.sponsors.map((s) =>
      s.id === body.id
        ? { ...s, ...body, href: body.href || undefined }
        : s,
    ),
  }));
}

export async function DELETE(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = z.object({ id: z.string() }).parse(await request.json());
  return patchStore((store) => ({
    ...store,
    sponsors: store.sponsors.filter((s) => s.id !== id),
  }));
}
