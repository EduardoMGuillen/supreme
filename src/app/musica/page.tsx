import type { Metadata } from "next";
import { MusicPlayer } from "@/components/MusicPlayer";
import { readStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "Música",
  description: "Escucha la música de Supremo. Previews y links a Spotify y YouTube.",
};

export default async function MusicaPage() {
  const store = await readStore();

  return (
    <div className="section-pad">
      <div className="container-narrow">
        <p className="text-[0.72rem] tracking-[0.16em] uppercase text-ink-soft">
          Discografía
        </p>
        <h1 className="font-display text-5xl md:text-7xl mt-2 mb-4">Música</h1>
        <p className="text-ink-soft max-w-xl mb-10">
          Preview de 30 segundos cuando Spotify lo permite. Abre la canción
          completa en Spotify o YouTube.
        </p>
        <MusicPlayer tracks={store.tracks} />
        <a
          href={store.config.handles.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="btn mt-10"
        >
          Ver en Spotify
        </a>
      </div>
    </div>
  );
}
