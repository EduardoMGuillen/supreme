import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, patchStore } from "@/lib/admin-api";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const { readStore } = await import("@/lib/store");
  return NextResponse.json((await readStore()).socialItems);
}

export async function PATCH(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = z
    .object({
      id: z.string(),
      pinned: z.boolean().optional(),
      hidden: z.boolean().optional(),
      title: z.string().optional(),
    })
    .parse(await request.json());

  return patchStore((store) => ({
    ...store,
    socialItems: store.socialItems.map((i) =>
      i.id === body.id ? { ...i, ...body } : i,
    ),
  }));
}

export async function DELETE(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = z.object({ id: z.string() }).parse(await request.json());
  return patchStore((store) => ({
    ...store,
    socialItems: store.socialItems.filter((i) => i.id !== id),
  }));
}
