import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { requireSession, patchStore } from "@/lib/admin-api";
import { slugify } from "@/lib/site";
import type { BlogPost } from "@/lib/types";

const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  slug: z.string().optional(),
  excerpt: z.string().min(2),
  cover: z.string().optional(),
  body: z.string().min(2),
  publishedAt: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const { readStore } = await import("@/lib/store");
  return NextResponse.json((await readStore()).posts);
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = schema.parse(await request.json());
  const post: BlogPost = {
    id: nanoid(),
    slug: body.slug || slugify(body.title),
    title: body.title,
    excerpt: body.excerpt,
    cover: body.cover || undefined,
    body: body.body,
    publishedAt: body.publishedAt || new Date().toISOString(),
    status: body.status || "draft",
  };
  return patchStore((store) => ({
    ...store,
    posts: [post, ...store.posts],
  }));
}

export async function PATCH(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = schema.extend({ id: z.string() }).parse(await request.json());
  return patchStore((store) => ({
    ...store,
    posts: store.posts.map((p) =>
      p.id === body.id
        ? {
            ...p,
            ...body,
            slug: body.slug || p.slug,
            cover: body.cover || undefined,
            publishedAt: body.publishedAt || p.publishedAt,
            status: body.status || p.status,
          }
        : p,
    ),
  }));
}

export async function DELETE(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = z.object({ id: z.string() }).parse(await request.json());
  return patchStore((store) => ({
    ...store,
    posts: store.posts.filter((p) => p.id !== id),
  }));
}
