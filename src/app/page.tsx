import Link from "next/link";
import { ContentGrid } from "@/components/ContentGrid";
import { Hero } from "@/components/Hero";
import { MusicPlayer } from "@/components/MusicPlayer";
import { SponsorsSection } from "@/components/SponsorsSection";
import { SOCIAL_LINKS } from "@/lib/site";
import { readStore } from "@/lib/store";

export default async function HomePage() {
  const store = await readStore();
  const publishedEvents = store.events
    .filter((e) => e.published)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextEvent =
    publishedEvents.find((e) => new Date(e.date) >= new Date()) ||
    publishedEvents[0];
  const posts = store.posts
    .filter((p) => p.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, 3);
  const featuredTracks = store.tracks
    .filter((t) => t.featured)
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);
  const tracks =
    featuredTracks.length > 0 ? featuredTracks : store.tracks.slice(0, 6);

  return (
    <>
      <Hero isLive={store.liveStatus.isLive} />

      <section className="section-pad">
        <div className="container-narrow">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[0.72rem] tracking-[0.16em] uppercase text-ink-soft">
                Ahora
              </p>
              <h2 className="font-display text-4xl md:text-6xl mt-2">
                Contenido reciente
              </h2>
            </div>
            <Link
              href="/contenido"
              className="hidden sm:inline text-[0.72rem] tracking-[0.12em] uppercase underline underline-offset-4"
            >
              Ver todo
            </Link>
          </div>
          <ContentGrid items={store.socialItems} limit={6} />
        </div>
      </section>

      <section className="section-pad bg-bg-muted">
        <div className="container-narrow">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[0.72rem] tracking-[0.16em] uppercase text-ink-soft">
                Discografía
              </p>
              <h2 className="font-display text-4xl md:text-6xl mt-2">Música</h2>
            </div>
            <Link
              href="/musica"
              className="hidden sm:inline text-[0.72rem] tracking-[0.12em] uppercase underline underline-offset-4"
            >
              Toda la música
            </Link>
          </div>
          <MusicPlayer tracks={tracks} />
        </div>
      </section>

      {nextEvent ? (
        <section className="section-pad">
          <div className="container-narrow grid gap-8 md:grid-cols-[1.2fr_1fr] items-end">
            <div>
              <p className="text-[0.72rem] tracking-[0.16em] uppercase text-ink-soft">
                Próximo evento
              </p>
              <h2 className="font-display text-4xl md:text-6xl mt-2 leading-[0.95]">
                {nextEvent.title}
              </h2>
              <p className="mt-4 text-ink-soft">
                {new Date(nextEvent.date).toLocaleString("es-HN", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
                {nextEvent.venue ? ` · ${nextEvent.venue}` : ""}
                {nextEvent.city ? `, ${nextEvent.city}` : ""}
              </p>
              {nextEvent.description ? (
                <p className="mt-4 max-w-xl leading-relaxed">
                  {nextEvent.description}
                </p>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                {nextEvent.ticketUrl ? (
                  <a
                    href={nextEvent.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                  >
                    Comprar entradas
                  </a>
                ) : null}
                <Link href={`/eventos/${nextEvent.slug}`} className="btn btn-ghost">
                  Más info
                </Link>
              </div>
            </div>
            {nextEvent.cover ? (
              <div className="aspect-[4/5] overflow-hidden bg-bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={nextEvent.cover}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/5] bg-ink text-white flex items-end p-8">
                <p className="font-display text-5xl tracking-wide">
                  {nextEvent.type.toUpperCase()}
                </p>
              </div>
            )}
          </div>
        </section>
      ) : null}

      <SponsorsSection sponsors={store.sponsors} />

      {posts.length ? (
        <section className="section-pad border-t border-[var(--line)]">
          <div className="container-narrow">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-[0.72rem] tracking-[0.16em] uppercase text-ink-soft">
                  Editorial
                </p>
                <h2 className="font-display text-4xl md:text-6xl mt-2">Blog</h2>
              </div>
              <Link
                href="/blog"
                className="hidden sm:inline text-[0.72rem] tracking-[0.12em] uppercase underline underline-offset-4"
              >
                Ver blog
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="border-t border-[var(--line)] pt-4">
                  <p className="text-xs text-ink-soft uppercase tracking-wider mb-3">
                    {new Date(post.publishedAt).toLocaleDateString("es-HN")}
                  </p>
                  <h3 className="text-xl leading-snug">
                    <Link href={`/blog/${post.slug}`} className="hover:text-accent">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-ink-soft text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-pad bg-ink text-white">
        <div className="container-narrow grid gap-8 md:grid-cols-[1.4fr_1fr] items-center">
          <div>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.95]">
              Patrocinios y colaboraciones
            </h2>
            <p className="mt-4 text-white/70 max-w-lg">
              Marcas, creators y proyectos. Escríbenos y armamos algo juntos.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              href="/contacto"
              className="btn bg-white text-ink border-white hover:bg-transparent hover:text-white"
            >
              Contactar
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-narrow">
          <p className="text-[0.72rem] tracking-[0.16em] uppercase text-ink-soft mb-6">
            Síguelo
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-4 font-display text-2xl md:text-4xl tracking-[0.04em]">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.key}
                href={store.config.handles[s.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
