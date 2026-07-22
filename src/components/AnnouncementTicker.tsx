import Link from "next/link";
import type { Announcement } from "@/lib/types";

export function AnnouncementTicker({ items }: { items: Announcement[] }) {
  if (!items.length) return null;

  const doubled = [...items, ...items, ...items, ...items];

  return (
    <div className="bg-ink text-white text-[0.72rem] tracking-[0.14em] uppercase border-b border-ink">
      <div className="marquee py-2.5">
        <div className="marquee-track font-display">
          {doubled.map((item, idx) => {
            const content = (
              <span className="inline-flex items-center gap-3 px-2">
                <span className="text-accent">●</span>
                <span>{item.text}</span>
              </span>
            );
            return item.href ? (
              <Link
                key={`${item.id}-${idx}`}
                href={item.href}
                className="hover:text-accent transition-colors"
              >
                {content}
              </Link>
            ) : (
              <span key={`${item.id}-${idx}`}>{content}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
