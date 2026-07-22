import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { readStore } from "@/lib/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await readStore();
  const post = store.posts.find((p) => p.slug === slug && p.status === "published");
  if (!post) return { title: "Blog" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: post.cover ? [post.cover] : undefined },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await readStore();
  const post = store.posts.find((p) => p.slug === slug && p.status === "published");
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.publishedAt,
    description: post.excerpt,
    image: post.cover || `${SITE_URL}/foto-supremo.jpg`,
    author: { "@type": "Person", name: "Supremo" },
  };

  return (
    <article className="section-pad">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-narrow max-w-3xl">
        <Link
          href="/blog"
          className="text-[0.72rem] tracking-[0.12em] uppercase underline underline-offset-4"
        >
          ← Blog
        </Link>
        <p className="mt-6 text-xs uppercase tracking-wider text-ink-soft">
          {new Date(post.publishedAt).toLocaleDateString("es-HN", {
            dateStyle: "long",
          })}
        </p>
        <h1 className="font-display text-4xl md:text-6xl mt-3 leading-[0.95]">
          {post.title}
        </h1>
        {post.cover ? (
          <div className="mt-8 aspect-[16/9] overflow-hidden bg-bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div className="mt-10 prose-like whitespace-pre-wrap leading-relaxed text-lg">
          {post.body}
        </div>
      </div>
    </article>
  );
}
