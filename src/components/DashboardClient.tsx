"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { StoreData } from "@/lib/types";

type Tab =
  | "overview"
  | "announcements"
  | "sponsors"
  | "events"
  | "posts"
  | "tracks"
  | "social"
  | "live"
  | "messages"
  | "config";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "announcements", label: "Anuncios" },
  { id: "sponsors", label: "Sponsors" },
  { id: "events", label: "Eventos" },
  { id: "posts", label: "Blog" },
  { id: "tracks", label: "Música" },
  { id: "social", label: "Social" },
  { id: "live", label: "Live" },
  { id: "messages", label: "Mensajes" },
  { id: "config", label: "Config" },
];

async function api(path: string, method: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
  return json;
}

export function DashboardClient({
  initial,
  user,
}: {
  initial: StoreData;
  user: string;
}) {
  const router = useRouter();
  const [store, setStore] = useState(initial);
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const unread = useMemo(
    () => store.contactMessages.filter((m) => !m.read).length,
    [store.contactMessages],
  );

  function applyStore(json: { store?: StoreData }) {
    if (json.store) setStore(json.store);
    router.refresh();
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setNote("");
    try {
      await action();
      setNote("Guardado");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="admin-shell bg-bg-muted min-h-screen">
      <aside className="bg-ink text-white p-5 md:min-h-screen">
        <p className="font-display text-xl tracking-wide">SUPREMO</p>
        <p className="text-xs text-white/50 mt-1 mb-6">{user}</p>
        <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`text-left text-xs tracking-[0.1em] uppercase px-3 py-2 whitespace-nowrap ${
                tab === t.id ? "bg-white text-ink" : "hover:bg-white/10"
              }`}
            >
              {t.label}
              {t.id === "messages" && unread ? ` (${unread})` : ""}
            </button>
          ))}
        </nav>
        <div className="mt-8 flex flex-col gap-2 text-xs">
          <Link href="/" className="underline underline-offset-4 text-white/70">
            Ver sitio
          </Link>
          <button type="button" onClick={logout} className="text-left text-white/70 underline underline-offset-4">
            Salir
          </button>
        </div>
      </aside>

      <div className="p-5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="font-display text-3xl tracking-wide">
            {TABS.find((t) => t.id === tab)?.label}
          </h1>
          <div className="flex items-center gap-3">
            {note ? <span className="text-sm text-ink-soft">{note}</span> : null}
            <button
              type="button"
              disabled={busy}
              className="btn !py-2"
              onClick={() =>
                run(async () => {
                  const json = await api("/api/admin/sync", "POST");
                  setNote(`Sync: ${(json.log || []).map((l: { platform: string; status: string }) => `${l.platform}:${l.status}`).join(", ")}`);
                  router.refresh();
                  const res = await fetch("/api/health");
                  void res;
                  // reload store via page refresh
                  window.location.reload();
                })
              }
            >
              Sincronizar
            </button>
          </div>
        </div>

        {tab === "overview" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Social" value={store.socialItems.length} />
            <Stat label="Tracks" value={store.tracks.length} />
            <Stat label="Eventos" value={store.events.length} />
            <Stat label="Mensajes" value={unread} />
            <div className="sm:col-span-2 border border-ink bg-bg p-4">
              <p className="text-xs uppercase tracking-wider text-ink-soft">Live</p>
              <p className="mt-2 font-display text-2xl">
                {store.liveStatus.isLive ? "EN VIVO" : "Offline"}
              </p>
              <p className="text-sm text-ink-soft mt-1">
                source: {store.liveStatus.source}
              </p>
            </div>
            <div className="sm:col-span-2 border border-ink bg-bg p-4">
              <p className="text-xs uppercase tracking-wider text-ink-soft">
                Última sync
              </p>
              <p className="mt-2 text-sm">
                {store.config.lastSyncAt
                  ? new Date(store.config.lastSyncAt).toLocaleString("es-HN")
                  : "Nunca"}
              </p>
              <ul className="mt-3 space-y-1 text-xs text-ink-soft">
                {store.config.syncLog.map((l) => (
                  <li key={`${l.platform}-${l.at}`}>
                    {l.platform}: {l.status}
                    {l.message ? ` — ${l.message}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {tab === "announcements" ? (
          <AnnouncementsPanel
            items={store.announcements}
            busy={busy}
            onChange={(fn) => run(fn)}
            applyStore={applyStore}
          />
        ) : null}

        {tab === "sponsors" ? (
          <SponsorsPanel
            items={store.sponsors}
            busy={busy}
            onChange={(fn) => run(fn)}
            applyStore={applyStore}
          />
        ) : null}

        {tab === "events" ? (
          <EventsPanel
            items={store.events}
            busy={busy}
            onChange={(fn) => run(fn)}
            applyStore={applyStore}
          />
        ) : null}

        {tab === "posts" ? (
          <PostsPanel
            items={store.posts}
            busy={busy}
            onChange={(fn) => run(fn)}
            applyStore={applyStore}
          />
        ) : null}

        {tab === "tracks" ? (
          <TracksPanel
            items={store.tracks}
            busy={busy}
            onChange={(fn) => run(fn)}
            applyStore={applyStore}
          />
        ) : null}

        {tab === "social" ? (
          <SocialPanel
            items={store.socialItems}
            busy={busy}
            onChange={(fn) => run(fn)}
            applyStore={applyStore}
          />
        ) : null}

        {tab === "live" ? (
          <LivePanel
            live={store.liveStatus}
            busy={busy}
            onChange={(fn) => run(fn)}
            applyStore={applyStore}
          />
        ) : null}

        {tab === "messages" ? (
          <MessagesPanel
            items={store.contactMessages}
            busy={busy}
            onChange={(fn) => run(fn)}
            applyStore={applyStore}
          />
        ) : null}

        {tab === "config" ? (
          <ConfigPanel
            config={store.config}
            busy={busy}
            onChange={(fn) => run(fn)}
            applyStore={applyStore}
          />
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-ink bg-bg p-4">
      <p className="text-xs uppercase tracking-wider text-ink-soft">{label}</p>
      <p className="font-display text-4xl mt-2">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function AnnouncementsPanel({
  items,
  busy,
  onChange,
  applyStore,
}: {
  items: StoreData["announcements"];
  busy: boolean;
  onChange: (fn: () => Promise<void>) => void;
  applyStore: (json: { store?: StoreData }) => void;
}) {
  return (
    <div className="grid gap-6">
      <form
        className="grid gap-3 border border-ink bg-bg p-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onChange(async () => {
            const json = await api("/api/admin/announcements", "POST", {
              text: fd.get("text"),
              href: fd.get("href") || undefined,
              active: true,
              order: Number(fd.get("order") || 0),
            });
            applyStore(json);
            e.currentTarget.reset();
          });
        }}
      >
        <Field label="Texto">
          <input name="text" className="input" required disabled={busy} />
        </Field>
        <Field label="Link (opcional)">
          <input name="href" className="input" disabled={busy} />
        </Field>
        <Field label="Orden">
          <input name="order" type="number" className="input" defaultValue={0} />
        </Field>
        <div className="flex items-end">
          <button type="submit" className="btn" disabled={busy}>
            Agregar anuncio
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {items.map((a) => (
          <li key={a.id} className="border border-ink bg-bg p-4 flex flex-wrap gap-3 justify-between items-center">
            <div>
              <p className="font-medium">{a.text}</p>
              <p className="text-xs text-ink-soft">
                {a.active ? "Activo" : "Inactivo"} · orden {a.order}
                {a.href ? ` · ${a.href}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-ghost !py-2"
                disabled={busy}
                onClick={() =>
                  onChange(async () => {
                    applyStore(
                      await api("/api/admin/announcements", "PATCH", {
                        id: a.id,
                        text: a.text,
                        active: !a.active,
                        order: a.order,
                        href: a.href,
                      }),
                    );
                  })
                }
              >
                {a.active ? "Desactivar" : "Activar"}
              </button>
              <button
                type="button"
                className="btn !py-2"
                disabled={busy}
                onClick={() =>
                  onChange(async () => {
                    applyStore(
                      await api("/api/admin/announcements", "DELETE", {
                        id: a.id,
                      }),
                    );
                  })
                }
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
      {!items.length ? (
        <p className="text-sm text-ink-soft">
          Sin anuncios: la barra superior no se muestra en la web.
        </p>
      ) : null}
    </div>
  );
}

function SponsorsPanel({
  items,
  busy,
  onChange,
  applyStore,
}: {
  items: StoreData["sponsors"];
  busy: boolean;
  onChange: (fn: () => Promise<void>) => void;
  applyStore: (json: { store?: StoreData }) => void;
}) {
  return (
    <div className="grid gap-6">
      <form
        className="grid gap-3 border border-ink bg-bg p-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onChange(async () => {
            applyStore(
              await api("/api/admin/sponsors", "POST", {
                name: fd.get("name"),
                logoUrl: fd.get("logoUrl"),
                href: fd.get("href") || undefined,
                type: fd.get("type"),
                active: true,
                order: Number(fd.get("order") || 0),
              }),
            );
            e.currentTarget.reset();
          });
        }}
      >
        <Field label="Nombre">
          <input name="name" className="input" required />
        </Field>
        <Field label="Logo URL">
          <input name="logoUrl" className="input" required placeholder="https://..." />
        </Field>
        <Field label="Link">
          <input name="href" className="input" />
        </Field>
        <Field label="Tipo">
          <select name="type" className="select" defaultValue="patrocinador">
            <option value="patrocinador">Patrocinador</option>
            <option value="colaboracion">Colaboración</option>
          </select>
        </Field>
        <Field label="Orden">
          <input name="order" type="number" className="input" defaultValue={0} />
        </Field>
        <div className="flex items-end">
          <button type="submit" className="btn" disabled={busy}>
            Agregar sponsor
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {items.map((s) => (
          <li key={s.id} className="border border-ink bg-bg p-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.logoUrl} alt="" className="h-10 w-auto max-w-[120px] object-contain" />
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-ink-soft">
                  {s.type} · {s.active ? "activo" : "inactivo"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-ghost !py-2"
                disabled={busy}
                onClick={() =>
                  onChange(async () => {
                    applyStore(
                      await api("/api/admin/sponsors", "PATCH", {
                        id: s.id,
                        name: s.name,
                        logoUrl: s.logoUrl,
                        type: s.type,
                        active: !s.active,
                        order: s.order,
                        href: s.href,
                      }),
                    );
                  })
                }
              >
                {s.active ? "Desactivar" : "Activar"}
              </button>
              <button
                type="button"
                className="btn !py-2"
                disabled={busy}
                onClick={() =>
                  onChange(async () => {
                    applyStore(
                      await api("/api/admin/sponsors", "DELETE", { id: s.id }),
                    );
                  })
                }
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
      {!items.length ? (
        <p className="text-sm text-ink-soft">
          Sin sponsors: la sección no aparece en la web.
        </p>
      ) : null}
    </div>
  );
}

function EventsPanel({
  items,
  busy,
  onChange,
  applyStore,
}: {
  items: StoreData["events"];
  busy: boolean;
  onChange: (fn: () => Promise<void>) => void;
  applyStore: (json: { store?: StoreData }) => void;
}) {
  return (
    <div className="grid gap-6">
      <form
        className="grid gap-3 border border-ink bg-bg p-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onChange(async () => {
            applyStore(
              await api("/api/admin/events", "POST", {
                title: fd.get("title"),
                date: new Date(String(fd.get("date"))).toISOString(),
                venue: fd.get("venue") || undefined,
                city: fd.get("city") || undefined,
                type: fd.get("type"),
                ticketUrl: fd.get("ticketUrl") || undefined,
                infoUrl: fd.get("infoUrl") || undefined,
                cover: fd.get("cover") || undefined,
                description: fd.get("description") || undefined,
                published: true,
              }),
            );
            e.currentTarget.reset();
          });
        }}
      >
        <Field label="Título">
          <input name="title" className="input" required />
        </Field>
        <Field label="Fecha y hora">
          <input name="date" type="datetime-local" className="input" required />
        </Field>
        <Field label="Tipo">
          <select name="type" className="select" defaultValue="partido">
            <option value="partido">Partido</option>
            <option value="concierto">Concierto</option>
            <option value="live">Live</option>
            <option value="otro">Otro</option>
          </select>
        </Field>
        <Field label="Venue">
          <input name="venue" className="input" />
        </Field>
        <Field label="Ciudad">
          <input name="city" className="input" />
        </Field>
        <Field label="URL entradas">
          <input name="ticketUrl" className="input" />
        </Field>
        <Field label="URL más info">
          <input name="infoUrl" className="input" />
        </Field>
        <Field label="Cover URL">
          <input name="cover" className="input" />
        </Field>
        <div className="md:col-span-2">
          <Field label="Descripción">
            <textarea name="description" className="textarea" />
          </Field>
        </div>
        <button type="submit" className="btn" disabled={busy}>
          Crear evento
        </button>
      </form>

      <ul className="space-y-3">
        {items.map((e) => (
          <li key={e.id} className="border border-ink bg-bg p-4 flex flex-wrap justify-between gap-3">
            <div>
              <p className="font-medium">{e.title}</p>
              <p className="text-xs text-ink-soft">
                {new Date(e.date).toLocaleString("es-HN")} · {e.type} ·{" "}
                {e.published ? "publicado" : "oculto"}
              </p>
            </div>
            <button
              type="button"
              className="btn !py-2"
              disabled={busy}
              onClick={() =>
                onChange(async () => {
                  applyStore(await api("/api/admin/events", "DELETE", { id: e.id }));
                })
              }
            >
              Borrar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PostsPanel({
  items,
  busy,
  onChange,
  applyStore,
}: {
  items: StoreData["posts"];
  busy: boolean;
  onChange: (fn: () => Promise<void>) => void;
  applyStore: (json: { store?: StoreData }) => void;
}) {
  return (
    <div className="grid gap-6">
      <form
        className="grid gap-3 border border-ink bg-bg p-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onChange(async () => {
            applyStore(
              await api("/api/admin/posts", "POST", {
                title: fd.get("title"),
                excerpt: fd.get("excerpt"),
                body: fd.get("body"),
                cover: fd.get("cover") || undefined,
                status: "published",
              }),
            );
            e.currentTarget.reset();
          });
        }}
      >
        <Field label="Título">
          <input name="title" className="input" required />
        </Field>
        <Field label="Excerpt">
          <input name="excerpt" className="input" required />
        </Field>
        <Field label="Cover URL">
          <input name="cover" className="input" />
        </Field>
        <Field label="Cuerpo">
          <textarea name="body" className="textarea" required />
        </Field>
        <button type="submit" className="btn w-fit" disabled={busy}>
          Publicar
        </button>
      </form>
      <ul className="space-y-3">
        {items.map((p) => (
          <li key={p.id} className="border border-ink bg-bg p-4 flex justify-between gap-3">
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-ink-soft">{p.status}</p>
            </div>
            <button
              type="button"
              className="btn !py-2"
              disabled={busy}
              onClick={() =>
                onChange(async () => {
                  applyStore(await api("/api/admin/posts", "DELETE", { id: p.id }));
                })
              }
            >
              Borrar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TracksPanel({
  items,
  busy,
  onChange,
  applyStore,
}: {
  items: StoreData["tracks"];
  busy: boolean;
  onChange: (fn: () => Promise<void>) => void;
  applyStore: (json: { store?: StoreData }) => void;
}) {
  return (
    <div className="grid gap-6">
      <form
        className="grid gap-3 border border-ink bg-bg p-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onChange(async () => {
            applyStore(
              await api("/api/admin/tracks", "POST", {
                title: fd.get("title"),
                artists: fd.get("artists") || undefined,
                cover: fd.get("cover") || undefined,
                previewUrl: fd.get("previewUrl") || undefined,
                spotifyUrl: fd.get("spotifyUrl") || undefined,
                youtubeUrl: fd.get("youtubeUrl") || undefined,
                featured: true,
                order: Number(fd.get("order") || 0),
              }),
            );
            e.currentTarget.reset();
          });
        }}
      >
        <Field label="Título">
          <input name="title" className="input" required />
        </Field>
        <Field label="Artistas">
          <input name="artists" className="input" />
        </Field>
        <Field label="Cover URL">
          <input name="cover" className="input" />
        </Field>
        <Field label="Preview URL">
          <input name="previewUrl" className="input" />
        </Field>
        <Field label="Spotify URL">
          <input name="spotifyUrl" className="input" />
        </Field>
        <Field label="YouTube URL">
          <input name="youtubeUrl" className="input" />
        </Field>
        <button type="submit" className="btn" disabled={busy}>
          Agregar track
        </button>
      </form>
      <ul className="space-y-2">
        {items.map((t) => (
          <li key={t.id} className="border border-ink bg-bg p-3 flex justify-between gap-3 items-center">
            <span className="text-sm">
              {t.title}{" "}
              <span className="text-ink-soft">({t.source || "spotify"})</span>
            </span>
            <button
              type="button"
              className="btn !py-1 !px-3"
              disabled={busy}
              onClick={() =>
                onChange(async () => {
                  applyStore(await api("/api/admin/tracks", "DELETE", { id: t.id }));
                })
              }
            >
              Borrar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialPanel({
  items,
  busy,
  onChange,
  applyStore,
}: {
  items: StoreData["socialItems"];
  busy: boolean;
  onChange: (fn: () => Promise<void>) => void;
  applyStore: (json: { store?: StoreData }) => void;
}) {
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.id} className="border border-ink bg-bg p-3 flex flex-wrap justify-between gap-3 items-center">
          <div className="min-w-0">
            <p className="text-sm truncate">
              <span className="uppercase text-xs text-accent mr-2">{i.platform}</span>
              {i.title}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-ghost !py-1 !px-3"
              disabled={busy}
              onClick={() =>
                onChange(async () => {
                  applyStore(
                    await api("/api/admin/social", "PATCH", {
                      id: i.id,
                      pinned: !i.pinned,
                    }),
                  );
                })
              }
            >
              {i.pinned ? "Unpin" : "Pin"}
            </button>
            <button
              type="button"
              className="btn !py-1 !px-3"
              disabled={busy}
              onClick={() =>
                onChange(async () => {
                  applyStore(
                    await api("/api/admin/social", "PATCH", {
                      id: i.id,
                      hidden: true,
                    }),
                  );
                })
              }
            >
              Ocultar
            </button>
          </div>
        </li>
      ))}
      {!items.length ? (
        <p className="text-sm text-ink-soft">Sin items. Corre sync.</p>
      ) : null}
    </ul>
  );
}

function LivePanel({
  live,
  busy,
  onChange,
  applyStore,
}: {
  live: StoreData["liveStatus"];
  busy: boolean;
  onChange: (fn: () => Promise<void>) => void;
  applyStore: (json: { store?: StoreData }) => void;
}) {
  return (
    <div className="border border-ink bg-bg p-6 grid gap-4 max-w-lg">
      <p className="font-display text-2xl">
        {live.isLive ? "EN VIVO" : "Offline"}
      </p>
      <p className="text-sm text-ink-soft">Fuente: {live.source}</p>
      <Field label="URL del live">
        <input
          className="input"
          defaultValue={live.url}
          id="live-url"
          disabled={busy}
        />
      </Field>
      <Field label="Título">
        <input
          className="input"
          defaultValue={live.title || ""}
          id="live-title"
          disabled={busy}
        />
      </Field>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn"
          disabled={busy}
          onClick={() =>
            onChange(async () => {
              const url =
                (document.getElementById("live-url") as HTMLInputElement)
                  ?.value || live.url;
              const title =
                (document.getElementById("live-title") as HTMLInputElement)
                  ?.value || "";
              applyStore(
                await api("/api/admin/live", "POST", {
                  isLive: true,
                  url,
                  title,
                  platform: "tiktok",
                }),
              );
            })
          }
        >
          Activar LIVE
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy}
          onClick={() =>
            onChange(async () => {
              applyStore(
                await api("/api/admin/live", "POST", {
                  isLive: false,
                  platform: "tiktok",
                }),
              );
            })
          }
        >
          Apagar
        </button>
      </div>
    </div>
  );
}

function MessagesPanel({
  items,
  busy,
  onChange,
  applyStore,
}: {
  items: StoreData["contactMessages"];
  busy: boolean;
  onChange: (fn: () => Promise<void>) => void;
  applyStore: (json: { store?: StoreData }) => void;
}) {
  return (
    <ul className="space-y-3">
      {items.map((m) => (
        <li
          key={m.id}
          className={`border border-ink bg-bg p-4 ${m.read ? "opacity-70" : ""}`}
        >
          <div className="flex flex-wrap justify-between gap-2">
            <p className="font-medium">
              [{m.motive}] {m.name} — {m.email}
            </p>
            <p className="text-xs text-ink-soft">
              {new Date(m.createdAt).toLocaleString("es-HN")}
            </p>
          </div>
          {m.company ? (
            <p className="text-sm text-ink-soft mt-1">{m.company}</p>
          ) : null}
          <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="btn btn-ghost !py-1 !px-3"
              disabled={busy}
              onClick={() =>
                onChange(async () => {
                  applyStore(
                    await api("/api/admin/messages", "PATCH", {
                      id: m.id,
                      read: !m.read,
                    }),
                  );
                })
              }
            >
              {m.read ? "No leído" : "Marcar leído"}
            </button>
            <button
              type="button"
              className="btn !py-1 !px-3"
              disabled={busy}
              onClick={() =>
                onChange(async () => {
                  applyStore(
                    await api("/api/admin/messages", "DELETE", { id: m.id }),
                  );
                })
              }
            >
              Borrar
            </button>
          </div>
        </li>
      ))}
      {!items.length ? (
        <p className="text-sm text-ink-soft">Sin mensajes todavía.</p>
      ) : null}
    </ul>
  );
}

function ConfigPanel({
  config,
  busy,
  onChange,
  applyStore,
}: {
  config: StoreData["config"];
  busy: boolean;
  onChange: (fn: () => Promise<void>) => void;
  applyStore: (json: { store?: StoreData }) => void;
}) {
  return (
    <form
      className="grid gap-3 border border-ink bg-bg p-4 max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onChange(async () => {
          applyStore(
            await api("/api/admin/config", "POST", {
              tagline: fd.get("tagline"),
              contactEmail: fd.get("contactEmail"),
              youtubeChannelId: fd.get("youtubeChannelId") || undefined,
              spotifyArtistId: fd.get("spotifyArtistId"),
              handles: {
                tiktok: fd.get("tiktok"),
                youtube: fd.get("youtube"),
                instagram: fd.get("instagram"),
                facebook: fd.get("facebook"),
                twitter: fd.get("twitter"),
                spotify: fd.get("spotify"),
              },
            }),
          );
        });
      }}
    >
      <Field label="Tagline">
        <input name="tagline" className="input" defaultValue={config.tagline} />
      </Field>
      <Field label="Email contacto">
        <input
          name="contactEmail"
          className="input"
          defaultValue={config.contactEmail}
        />
      </Field>
      <Field label="YouTube channel ID">
        <input
          name="youtubeChannelId"
          className="input"
          defaultValue={config.youtubeChannelId || ""}
        />
      </Field>
      <Field label="Spotify artist ID">
        <input
          name="spotifyArtistId"
          className="input"
          defaultValue={config.spotifyArtistId}
        />
      </Field>
      {(
        [
          "tiktok",
          "youtube",
          "instagram",
          "facebook",
          "twitter",
          "spotify",
        ] as const
      ).map((k) => (
        <Field key={k} label={k}>
          <input name={k} className="input" defaultValue={config.handles[k]} />
        </Field>
      ))}
      <button type="submit" className="btn w-fit" disabled={busy}>
        Guardar config
      </button>
    </form>
  );
}
