import Link from "next/link";
import type { Sponsor } from "@/lib/types";

export function SponsorsSection({ sponsors }: { sponsors: Sponsor[] }) {
  const active = sponsors
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order);

  if (!active.length) return null;

  const patrocinadores = active.filter((s) => s.type === "patrocinador");
  const colaboraciones = active.filter((s) => s.type === "colaboracion");

  return (
    <section className="section-pad border-t border-[var(--line)]">
      <div className="container-narrow">
        <p className="text-[0.72rem] tracking-[0.16em] uppercase text-ink-soft">
          Partners
        </p>
        <h2 className="font-display text-4xl md:text-6xl mt-3 mb-10">
          Con quién va
        </h2>

        {patrocinadores.length ? (
          <SponsorGroup title="Patrocinadores" items={patrocinadores} />
        ) : null}
        {colaboraciones.length ? (
          <SponsorGroup
            title="Colaboraciones"
            items={colaboraciones}
            className={patrocinadores.length ? "mt-12" : undefined}
          />
        ) : null}
      </div>
    </section>
  );
}

function SponsorGroup({
  title,
  items,
  className,
}: {
  title: string;
  items: Sponsor[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-[0.72rem] tracking-[0.14em] uppercase text-ink-soft mb-6">
        {title}
      </h3>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-10 items-center">
        {items.map((s) => {
          const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.logoUrl}
              alt={s.name}
              className="max-h-14 w-auto max-w-full object-contain grayscale opacity-80 transition duration-300 group-hover:grayscale-0 group-hover:opacity-100"
            />
          );
          return (
            <li key={s.id} className="group flex items-center justify-center min-h-16">
              {s.href ? (
                <Link
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                >
                  {img}
                </Link>
              ) : (
                img
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
