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
  const event = store.events.find((e) => e.slug === slug && e.published);
  if (!event) return { title: "Evento" };
  return {
    title: event.title,
    description: event.description || `${event.title} — Supremo`,
    openGraph: {
      images: event.cover ? [event.cover] : undefined,
    },
  };
}

export default async function EventoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await readStore();
  const event = store.events.find((e) => e.slug === slug && e.published);
  if (!event) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.date,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.venue || event.city || "Honduras",
      address: event.city || "Honduras",
    },
    image: event.cover ? [event.cover] : [`${SITE_URL}/supremo-hero.jpg`],
    description: event.description,
    organizer: {
      "@type": "Person",
      name: "Supremo",
      url: SITE_URL,
    },
    offers: event.ticketUrl
      ? {
          "@type": "Offer",
          url: event.ticketUrl,
          availability: "https://schema.org/InStock",
        }
      : undefined,
  };

  return (
    <div className="section-pad">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-narrow grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Link
            href="/eventos"
            className="text-[0.72rem] tracking-[0.12em] uppercase underline underline-offset-4"
          >
            ← Eventos
          </Link>
          <p className="mt-6 text-[0.72rem] tracking-[0.16em] uppercase text-accent">
            {event.type}
          </p>
          <h1 className="font-display text-5xl md:text-7xl mt-3 leading-[0.92]">
            {event.title}
          </h1>
          <p className="mt-6 text-lg text-ink-soft">
            {new Date(event.date).toLocaleString("es-HN", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
          <p className="mt-2 text-ink-soft">
            {[event.venue, event.city].filter(Boolean).join(" · ")}
          </p>
          {event.description ? (
            <p className="mt-8 leading-relaxed max-w-xl whitespace-pre-wrap">
              {event.description}
            </p>
          ) : null}
          <div className="mt-10 flex flex-wrap gap-3">
            {event.ticketUrl ? (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
              >
                Comprar entradas
              </a>
            ) : null}
            {event.infoUrl ? (
              <a
                href={event.infoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                Más información
              </a>
            ) : null}
          </div>
        </div>
        {event.cover ? (
          <div className="aspect-[4/5] overflow-hidden bg-bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.cover} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="aspect-[4/5] bg-bg-muted" />
        )}
      </div>
    </div>
  );
}
