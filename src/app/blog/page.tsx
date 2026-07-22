import type { Metadata } from "next";
import Link from "next/link";
import { readStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "Blog",
  description: "Noticias, bastidores y anuncios de Supremo.",
};

export default async function BlogPage() {
  const store = await readStore();
  const posts = store.posts
    .filter((p) => p.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

  return (
    <div className="section-pad">
      <div className="container-narrow">
        <p className="text-[0.72rem] tracking-[0.16em] uppercase text-ink-soft">
          Editorial
        </p>
        <h1 className="font-display text-5xl md:text-7xl mt-2 mb-10">Blog</h1>

        {!posts.length ? (
          <p className="text-ink-soft">Pronto habrá publicaciones nuevas.</p>
        ) : (
          <div className="grid gap-10">
            {posts.map((post) => (
              <article
                key={post.id}
                className="grid gap-6 md:grid-cols-[240px_1fr] border-t border-[var(--line)] pt-8"
              >
                {post.cover ? (
                  <Link href={`/blog/${post.slug}`} className="block aspect-[4/3] overflow-hidden bg-bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.cover}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </Link>
                ) : (
                  <div className="aspect-[4/3] bg-bg-muted" />
                )}
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink-soft">
                    {new Date(post.publishedAt).toLocaleDateString("es-HN", {
                      dateStyle: "long",
                    })}
                  </p>
                  <h2 className="text-3xl mt-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-accent">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-ink-soft max-w-2xl leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
