import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/site";
import type { SiteConfig } from "@/lib/types";

export function SiteFooter({ config }: { config: SiteConfig }) {
  return (
    <footer className="border-t border-[var(--line)] bg-ink text-white mt-auto">
      <div className="container-narrow section-pad !py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl tracking-[0.06em]">SOY SUPREMO</p>
          <p className="mt-3 max-w-sm text-white/70 text-sm leading-relaxed">
            {config.tagline}
          </p>
        </div>

        <div>
          <p className="text-[0.7rem] tracking-[0.14em] uppercase text-white/50 mb-4">
            Explorar
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/contenido">Contenido</Link>
            <Link href="/musica">Música</Link>
            <Link href="/eventos">Eventos</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/acerca-de">Acerca de</Link>
            <Link href="/contacto">Contacto / Patrocinios</Link>
          </div>
        </div>

        <div>
          <p className="text-[0.7rem] tracking-[0.14em] uppercase text-white/50 mb-4">
            Redes
          </p>
          <div className="flex flex-col gap-2 text-sm">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.key}
                href={config.handles[s.key]}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-narrow px-4 py-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs text-white/45">
          <span>© {new Date().getFullYear()} SoySupremo · soysupremohn.com</span>
          <div className="flex gap-4">
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/terminos">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
