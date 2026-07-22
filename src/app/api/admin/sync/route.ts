import { NextResponse } from "next/server";
import {
  authorizeCronOrSession,
  getSessionUser,
} from "@/lib/auth";
import { runSync } from "@/lib/sync";

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

async function handle(request: Request) {
  const user = await getSessionUser();
  const allowed = authorizeCronOrSession(
    request.headers.get("authorization"),
    user,
  );
  if (!allowed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runSync();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Sync failed",
      },
      { status: 500 },
    );
  }
}
