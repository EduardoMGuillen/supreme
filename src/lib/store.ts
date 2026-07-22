import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { createEmptyStore } from "./site";
import type { StoreData } from "./types";

const STORE_PATH = path.join(process.cwd(), "data", "store.json");
const TABLE = "supremo_site_state";
const ROW_ID = "main";

let memoryStore: StoreData | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key || !isHttpUrl(url)) return null;
  try {
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch {
    return null;
  }
}

function mergeStore(raw: unknown): StoreData {
  const empty = createEmptyStore();
  if (!raw || typeof raw !== "object") return empty;
  const data = raw as Partial<StoreData>;
  return {
    ...empty,
    ...data,
    socialItems: data.socialItems ?? [],
    tracks: data.tracks ?? [],
    events: data.events ?? [],
    posts: data.posts ?? [],
    announcements: data.announcements ?? [],
    sponsors: data.sponsors ?? [],
    liveStatus: { ...empty.liveStatus, ...data.liveStatus },
    contactMessages: data.contactMessages ?? [],
    config: {
      ...empty.config,
      ...data.config,
      handles: { ...empty.config.handles, ...data.config?.handles },
      syncLog: data.config?.syncLog ?? [],
    },
  };
}

async function readFromFile(): Promise<StoreData> {
  try {
    const text = await fs.readFile(STORE_PATH, "utf8");
    return mergeStore(JSON.parse(text));
  } catch {
    return createEmptyStore();
  }
}

async function writeToFile(store: StoreData): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  const tmp = `${STORE_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmp, STORE_PATH);
}

export async function readStore(): Promise<StoreData> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("payload")
      .eq("id", ROW_ID)
      .maybeSingle();
    if (!error && data?.payload) {
      memoryStore = mergeStore(data.payload);
      return memoryStore;
    }
  }

  if (memoryStore) return memoryStore;
  memoryStore = await readFromFile();
  return memoryStore;
}

export async function writeStore(
  updater: (current: StoreData) => StoreData | Promise<StoreData>,
): Promise<StoreData> {
  const run = async () => {
    const current = await readStore();
    const next = await updater(current);
    next.updatedAt = new Date().toISOString();
    next.version = current.version || 1;

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from(TABLE).upsert({
        id: ROW_ID,
        payload: next,
        updated_at: next.updatedAt,
      });
      if (error) {
        throw new Error(`Supabase write failed: ${error.message}`);
      }
    } else if (process.env.VERCEL) {
      throw new Error(
        "En Vercel hace falta SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (el filesystem es read-only). Crea la tabla supremo_site_state con supabase/schema.sql.",
      );
    } else {
      await writeToFile(next);
    }

    memoryStore = next;
    return next;
  };

  const result = writeQueue.then(run, run);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export function storageMode(): "supabase" | "file-or-memory" {
  return getSupabase() ? "supabase" : "file-or-memory";
}
