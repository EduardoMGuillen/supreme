import Link from "next/link";
import type { SocialItem } from "@/lib/types";

const LABELS: Record<string, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X",
  spotify: "Spotify",
};

export function ContentGrid({
  items,
  limit,
}: {
  items: SocialItem[];
  limit?: number;
}) {
  const list = (limit ? items.slice(0, limit) : items).filter((i) => !i.hidden);

  if (!list.length) {
    return (
      <p className="text-ink-soft">
        Aún no hay contenido sincronizado. Ejecuta sync desde el admin o espera
        el cron.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((item) => (
        <article key={item.id} className="group border-t border-[var(--line)] pt-4">
          <p className="text-[0.68rem] tracking-[0.14em] uppercase text-accent mb-3">
            {LABELS[item.platform] || item.platform}
            {item.pinned ? " · Destacado" : ""}
          </p>
          <Link
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {item.thumbnail ? (
              <div className="aspect-[16/10] overflow-hidden bg-bg-muted mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
            ) : null}
            <h3 className="text-lg leading-snug group-hover:text-accent transition-colors">
              {item.title}
            </h3>
            <p className="mt-2 text-xs text-ink-soft tracking-wide uppercase">
              {new Date(item.publishedAt).toLocaleDateString("es-HN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </Link>
        </article>
      ))}
    </div>
  );
}
