import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, patchStore } from "@/lib/admin-api";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const { readStore } = await import("@/lib/store");
  return NextResponse.json((await readStore()).contactMessages);
}

export async function PATCH(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = z
    .object({ id: z.string(), read: z.boolean() })
    .parse(await request.json());

  return patchStore((store) => ({
    ...store,
    contactMessages: store.contactMessages.map((m) =>
      m.id === body.id ? { ...m, read: body.read } : m,
    ),
  }));
}

export async function DELETE(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = z.object({ id: z.string() }).parse(await request.json());
  return patchStore((store) => ({
    ...store,
    contactMessages: store.contactMessages.filter((m) => m.id !== id),
  }));
}
