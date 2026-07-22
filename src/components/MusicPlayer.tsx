"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Track } from "@/lib/types";

export function MusicPlayer({ tracks }: { tracks: Track[] }) {
  const sorted = [...tracks].sort((a, b) => a.order - b.order);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  async function toggle(track: Track) {
    if (!track.previewUrl) {
      if (track.spotifyUrl) window.open(track.spotifyUrl, "_blank");
      return;
    }

    if (currentId === track.id) {
      audioRef.current?.pause();
      setCurrentId(null);
      return;
    }

    audioRef.current?.pause();
    const audio = new Audio(track.previewUrl);
    audioRef.current = audio;
    setCurrentId(track.id);
    audio.onended = () => setCurrentId(null);
    try {
      await audio.play();
    } catch {
      setCurrentId(null);
    }
  }

  if (!sorted.length) {
    return (
      <p className="text-ink-soft">
        La discografía se sincroniza desde Spotify. Configura las claves o
        agrégala desde el panel admin.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
      {sorted.map((track) => {
        const playing = currentId === track.id;
        return (
          <li
            key={track.id}
            className="grid grid-cols-[64px_1fr_auto] sm:grid-cols-[72px_1fr_auto_auto] gap-4 items-center py-4"
          >
            <button
              type="button"
              onClick={() => toggle(track)}
              className="relative h-16 w-16 sm:h-[72px] sm:w-[72px] overflow-hidden border border-[var(--line)] group"
              aria-label={playing ? "Pausar" : "Reproducir preview"}
            >
              {track.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={track.cover}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-bg-muted" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white opacity-0 group-hover:opacity-100 transition">
                {playing ? <Pause size={18} /> : <Play size={18} />}
              </span>
            </button>

            <div className="min-w-0">
              <p className="font-medium truncate">{track.title}</p>
              {track.artists ? (
                <p className="text-sm text-ink-soft truncate">{track.artists}</p>
              ) : null}
            </div>

            <div className="hidden sm:flex gap-3 text-[0.7rem] tracking-[0.1em] uppercase">
              {track.spotifyUrl ? (
                <a
                  href={track.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-accent"
                >
                  Spotify
                </a>
              ) : null}
              {track.youtubeUrl ? (
                <a
                  href={track.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-accent"
                >
                  YouTube
                </a>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => toggle(track)}
              className="btn btn-ghost !px-3 !py-2"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
