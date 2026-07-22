"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

export function Hero({ isLive }: { isLive: boolean }) {
  return (
    <section className="relative min-h-[100svh] overflow-hidden grain bg-bg-muted">
      <div className="absolute inset-0">
        <Image
          src="/supremo-hero.jpg"
          alt="Supremo"
          fill
          priority
          className="object-cover object-[center_18%] md:object-[center_12%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
      </div>

      <div className="relative container-narrow min-h-[100svh] flex flex-col justify-end px-4 pb-16 pt-28 md:pb-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white/70 text-[0.75rem] tracking-[0.22em] uppercase mb-4"
        >
          Honduras · Oficial
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08 }}
          className="font-display text-white text-[clamp(3.4rem,14vw,8.5rem)] leading-[0.88] tracking-[-0.03em] max-w-4xl"
        >
          SOY
          <br />
          SUPREMO
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="mt-6 max-w-md text-white/80 text-base md:text-lg leading-relaxed"
        >
          Humor, música y partidos. El hub de todo lo que está pasando ahora.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.32 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link href="/contenido" className="btn bg-white text-ink border-white hover:bg-transparent hover:text-white">
            Ver contenido
          </Link>
          <Link href="/musica" className="btn btn-ghost border-white text-white hover:bg-white hover:text-ink">
            Escuchar
          </Link>
          {isLive ? (
            <Link
              href="https://www.tiktok.com/@supremolives/live"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-accent"
            >
              En vivo ahora
            </Link>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
