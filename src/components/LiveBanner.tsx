import Link from "next/link";
import type { LiveStatus } from "@/lib/types";

export function LiveBanner({ live }: { live: LiveStatus }) {
  if (!live.isLive) return null;

  return (
    <div className="bg-accent text-white">
      <div className="container-narrow flex items-center justify-between gap-4 px-4 py-2 text-sm">
        <div className="flex items-center gap-3 font-display tracking-[0.12em] text-xs sm:text-sm">
          <span className="live-dot inline-block h-2.5 w-2.5 rounded-full bg-white" />
          EN VIVO {live.title ? `— ${live.title}` : "EN TIKTOK"}
        </div>
        <Link
          href={live.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 text-xs tracking-widest uppercase"
        >
          Entrar al live
        </Link>
      </div>
    </div>
  );
}
