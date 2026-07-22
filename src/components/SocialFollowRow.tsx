import type { SiteConfig } from "@/lib/types";
import { SOCIAL_LINKS } from "@/lib/site";

function Icon({ name }: { name: (typeof SOCIAL_LINKS)[number]["key"] }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true as const,
  };

  switch (name) {
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .56.04.82.12v-3.4a6.22 6.22 0 0 0-.82-.05A6.33 6.33 0 0 0 3.16 15.4a6.33 6.33 0 0 0 6.33 6.33 6.33 6.33 0 0 0 6.33-6.33V9.25a8.18 8.18 0 0 0 4.77 1.52V7.3a4.85 4.85 0 0 1-1-.61Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.75 15.5v-7l6.5 3.5-6.5 3.5Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.9A3.1 3.1 0 1 1 12 8.9a3.1 3.1 0 0 1 0 6.2Zm6.1-8.1a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0ZM12 2.2c-2.7 0-3.04.01-4.1.06A5.9 5.9 0 0 0 3.9 3.9 5.9 5.9 0 0 0 2.26 7.9C2.21 8.96 2.2 9.3 2.2 12s.01 3.04.06 4.1A5.9 5.9 0 0 0 3.9 20.1a5.9 5.9 0 0 0 4 1.64c1.06.05 1.4.06 4.1.06s3.04-.01 4.1-.06a5.9 5.9 0 0 0 4-1.64 5.9 5.9 0 0 0 1.64-4c.05-1.06.06-1.4.06-4.1s-.01-3.04-.06-4.1A5.9 5.9 0 0 0 20.1 3.9a5.9 5.9 0 0 0-4-1.64C15.04 2.21 14.7 2.2 12 2.2Zm0 1.7c2.65 0 2.96.01 4 .06a4.2 4.2 0 0 1 2.8 1.14 4.2 4.2 0 0 1 1.14 2.8c.05 1.04.06 1.35.06 4s-.01 2.96-.06 4a4.2 4.2 0 0 1-1.14 2.8 4.2 4.2 0 0 1-2.8 1.14c-1.04.05-1.35.06-4 .06s-2.96-.01-4-.06a4.2 4.2 0 0 1-2.8-1.14 4.2 4.2 0 0 1-1.14-2.8C3.91 14.96 3.9 14.65 3.9 12s.01-2.96.06-4A4.2 4.2 0 0 1 5.1 5.2 4.2 4.2 0 0 1 7.9 4.06c1.04-.05 1.35-.06 4-.06Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path d="M14 8.2h2.7V5H14c-2.7 0-4.5 1.7-4.5 4.6V12H7v3.3h2.5V22h3.4v-6.7H16L16.7 12h-3.3V9.8c0-.9.3-1.6 1.6-1.6Z" />
        </svg>
      );
    case "twitter":
      return (
        <svg {...common}>
          <path d="M18.2 2H21l-6.5 7.4L22 22h-6.2l-4.9-6.4L5.3 22H2.5l7-8L2 2h6.3l4.4 5.8L18.2 2Zm-1.1 18h1.7L7 3.9H5.2L17.1 20Z" />
        </svg>
      );
    case "spotify":
      return (
        <svg {...common}>
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.6 14.4a.62.62 0 0 1-.86.2c-2.35-1.44-5.3-1.76-8.78-.96a.62.62 0 1 1-.28-1.22c3.8-.87 7.05-.5 9.7 1.12a.62.62 0 0 1 .22.86Zm1.23-2.74a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.16a.78.78 0 0 1-.45-1.49c3.64-1.1 8.17-.57 11.27 1.33a.78.78 0 0 1 .22 1.06Zm.1-2.86C14.7 8.9 9.1 8.7 5.86 9.7a.94.94 0 0 1-.55-1.8c3.72-1.13 9.9-.9 13.8 1.45a.94.94 0 1 1-.98 1.6Z" />
        </svg>
      );
    default:
      return null;
  }
}

export function SocialFollowRow({
  handles,
  variant = "light",
}: {
  handles: SiteConfig["handles"];
  variant?: "light" | "dark";
}) {
  const hover =
    variant === "dark" ? "hover:text-accent" : "hover:text-accent";

  return (
    <ul className="grid grid-cols-3 sm:grid-cols-6 gap-3 w-full">
      {SOCIAL_LINKS.map((s) => (
        <li key={s.key} className="min-w-0">
          <a
            href={handles[s.key]}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center gap-2 border border-[var(--line)] px-2 py-4 text-center transition-colors ${hover}`}
            aria-label={s.label}
          >
            <Icon name={s.key} />
            <span className="font-display text-[0.7rem] sm:text-xs tracking-[0.12em] uppercase truncate w-full">
              {s.label}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
