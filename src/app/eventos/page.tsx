import type { Metadata } from "next";
import Link from "next/link";
import { readStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Conciertos, partidos y lives de Supremo.",
};

export default async function EventosPage() {
  const store = await readStore();
  const events = store.events
    .filter((e) => e.published)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="section-pad">
      <div className="container-narrow">
        <p className="text-[0.72rem] tracking-[0.16em] uppercase text-ink-soft">
          Agenda
        </p>
        <h1 className="font-display text-5xl md:text-7xl mt-2 mb-10">Eventos</h1>

        {!events.length ? (
          <p className="text-ink-soft">
            Pronto habrá fechas nuevas. Mientras tanto, síguelo en redes.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {events.map((event) => (
              <li
                key={event.id}
                className="grid gap-4 md:grid-cols-[140px_1fr_auto] py-6 items-start"
              >
                <div>
                  <p className="font-display text-2xl">
                    {new Date(event.date).toLocaleDateString("es-HN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-ink-soft mt-1">
                    {event.type}
                  </p>
                </div>
                <div>
                  <h2 className="text-2xl">
                    <Link
                      href={`/eventos/${event.slug}`}
                      className="hover:text-accent"
                    >
                      {event.title}
                    </Link>
                  </h2>
                  <p className="text-ink-soft mt-2">
                    {[event.venue, event.city].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.ticketUrl ? (
                    <a
                      href={event.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn !py-2"
                    >
                      Entradas
                    </a>
                  ) : null}
                  <Link href={`/eventos/${event.slug}`} className="btn btn-ghost !py-2">
                    Info
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
