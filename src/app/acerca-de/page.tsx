import type { Metadata } from "next";
import Link from "next/link";
import { SocialFollowRow } from "@/components/SocialFollowRow";
import { readStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "Acerca de",
  description: "Quién es Supremo.",
};

export default async function AcercaPage() {
  const store = await readStore();

  return (
    <div className="section-pad">
      <div className="container-narrow grid gap-12 md:grid-cols-[1.1fr_0.9fr] items-start">
        <div>
          <p className="text-[0.72rem] tracking-[0.16em] uppercase text-ink-soft">
            Marca
          </p>
          <h1 className="font-display text-5xl md:text-7xl mt-2 leading-[0.92]">
            Supremo
          </h1>
          <p className="mt-8 text-lg leading-relaxed text-ink-soft max-w-xl">
            Lester Cardona, conocido como Supremo, es uno de los
            creadores más grandes de Honduras. Humor, música, lives y partidos
            entre selecciones de tiktokers: contenido que mueve Centroamérica.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft max-w-xl">
            Esta web es el hub oficial: lo nuevo en redes, la música, los
            eventos y el punto de contacto para marcas y colaboraciones.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/contacto" className="btn">
              Contacto / Patrocinios
            </Link>
            <Link href="/contenido" className="btn btn-ghost">
              Ver contenido
            </Link>
          </div>
        </div>

        <div className="border-t border-[var(--line)] pt-6">
          <p className="text-[0.72rem] tracking-[0.14em] uppercase text-ink-soft mb-5">
            Redes oficiales
          </p>
          <SocialFollowRow handles={store.config.handles} />
        </div>
      </div>
    </div>
  );
}
