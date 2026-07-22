import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { readStore, writeStore } from "@/lib/store";
import type { StoreData } from "@/lib/types";

export async function requireSession() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ ok: false }, { status: 401 }) };
  }
  return { user, error: null };
}

export async function getStoreResponse() {
  const store = await readStore();
  return NextResponse.json(store);
}

export async function patchStore(
  updater: (store: StoreData) => StoreData,
) {
  const store = await writeStore(updater);
  return NextResponse.json({ ok: true, store });
}
