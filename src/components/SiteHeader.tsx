"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/contenido", label: "Contenido" },
  { href: "/musica", label: "Música" },
  { href: "/eventos", label: "Eventos" },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-md">
      <div className="container-narrow flex items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-display text-xl tracking-[0.08em]">
          SOY SUPREMO
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-[0.78rem] tracking-[0.12em] uppercase">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "text-accent"
                  : "hover:text-accent transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden text-[0.75rem] tracking-[0.14em] uppercase border border-ink px-3 py-2"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Menú"
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t border-[var(--line)] bg-bg px-4 py-4 flex flex-col gap-4">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-display tracking-[0.1em] text-lg"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
