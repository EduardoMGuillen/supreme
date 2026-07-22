import type { Metadata } from "next";
import { ContentGrid } from "@/components/ContentGrid";
import { readStore } from "@/lib/store";
import type { Platform } from "@/lib/types";

export const metadata: Metadata = {
  title: "Contenido",
  description: "Lo más reciente de Supremo en YouTube, TikTok, Instagram, Facebook y X.",
};

const FILTERS: { id: "all" | Platform; label: string }[] = [
  { id: "all", label: "Todo" },
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "twitter", label: "X" },
];

export default async function ContenidoPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  const store = await readStore();
  const platform = (p || "all") as "all" | Platform;
  const items =
    platform === "all"
      ? store.socialItems
      : store.socialItems.filter((i) => i.platform === platform);

  return (
    <div className="section-pad">
      <div className="container-narrow">
        <p className="text-[0.72rem] tracking-[0.16em] uppercase text-ink-soft">
          Hub
        </p>
        <h1 className="font-display text-5xl md:text-7xl mt-2 mb-8">Contenido</h1>

        <div className="flex flex-wrap gap-2 mb-10">
          {FILTERS.map((f) => {
            const active = platform === f.id;
            return (
              <a
                key={f.id}
                href={f.id === "all" ? "/contenido" : `/contenido?p=${f.id}`}
                className={`filter-chip text-[0.72rem] tracking-[0.12em] uppercase border px-3 py-2 transition-colors ${
                  active
                    ? "is-active border-[var(--ink)] bg-[var(--ink)]"
                    : "border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)]"
                }`}
              >
                {f.label}
              </a>
            );
          })}
        </div>

        <ContentGrid items={items} />
      </div>
    </div>
  );
}
