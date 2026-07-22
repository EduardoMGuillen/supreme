export type Platform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "twitter"
  | "spotify";

export type SocialItem = {
  id: string;
  platform: Platform;
  title: string;
  thumbnail?: string;
  url: string;
  publishedAt: string;
  embedHtml?: string;
  pinned?: boolean;
  hidden?: boolean;
};

export type Track = {
  id: string;
  title: string;
  artists?: string;
  cover?: string;
  previewUrl?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  featured?: boolean;
  order: number;
  source?: "spotify" | "manual";
};

export type EventType = "concierto" | "partido" | "live" | "otro";

export type SiteEvent = {
  id: string;
  slug: string;
  title: string;
  date: string;
  venue?: string;
  city?: string;
  type: EventType;
  ticketUrl?: string;
  infoUrl?: string;
  cover?: string;
  description?: string;
  featured?: boolean;
  published: boolean;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover?: string;
  body: string;
  publishedAt: string;
  status: "draft" | "published";
};

export type Announcement = {
  id: string;
  text: string;
  href?: string;
  active: boolean;
  order: number;
  startsAt?: string;
  endsAt?: string;
};

export type SponsorType = "patrocinador" | "colaboracion";

export type Sponsor = {
  id: string;
  name: string;
  logoUrl: string;
  href?: string;
  type: SponsorType;
  active: boolean;
  order: number;
};

export type LiveStatus = {
  isLive: boolean;
  platform: "tiktok" | "youtube" | "instagram" | "other";
  url: string;
  title?: string;
  updatedAt: string;
  source: "auto" | "manual";
};

export type ContactMotive = "contacto" | "patrocinio" | "colaboracion";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  company?: string;
  motive: ContactMotive;
  message: string;
  createdAt: string;
  read: boolean;
};

export type SyncPlatformResult = {
  platform: Platform;
  status: "ok" | "skipped" | "error";
  count?: number;
  message?: string;
  at: string;
};

export type SiteConfig = {
  siteName: string;
  siteUrl: string;
  tagline: string;
  contactEmail: string;
  handles: {
    tiktok: string;
    youtube: string;
    instagram: string;
    facebook: string;
    twitter: string;
    spotify: string;
  };
  youtubeChannelId?: string;
  spotifyArtistId: string;
  lastSyncAt?: string;
  syncLog: SyncPlatformResult[];
};

export type StoreData = {
  version: number;
  updatedAt: string;
  socialItems: SocialItem[];
  tracks: Track[];
  events: SiteEvent[];
  posts: BlogPost[];
  announcements: Announcement[];
  sponsors: Sponsor[];
  liveStatus: LiveStatus;
  contactMessages: ContactMessage[];
  config: SiteConfig;
};
