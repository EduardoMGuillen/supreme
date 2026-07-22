import { NextResponse } from "next/server";
import {
  createSessionToken,
  sessionCookieOptions,
  validateAdminCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const username = String(body.username || "");
  const password = String(body.password || "");

  if (!validateAdminCredentials(username, password)) {
    return NextResponse.json(
      { ok: false, error: "Credenciales inválidas" },
      { status: 401 },
    );
  }

  const token = createSessionToken(username);
  const response = NextResponse.json({ ok: true });
  const opts = sessionCookieOptions(token);
  response.cookies.set(opts);
  return response;
}
