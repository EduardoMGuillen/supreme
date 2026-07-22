import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/resend";
import { writeStore } from "@/lib/store";
import { nanoid } from "nanoid";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  company: z.string().trim().max(160).optional(),
  motive: z.enum(["contacto", "patrocinio", "colaboracion"]),
  message: z.string().trim().min(10).max(4000),
  website: z.string().optional(),
});

const hits = new Map<string, { count: number; reset: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || row.reset < now) {
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (row.count >= 5) return false;
  row.count += 1;
  return true;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "Demasiados intentos. Espera un minuto." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Revisa los campos del formulario." },
      { status: 400 },
    );
  }

  // honeypot
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, company, motive, message } = parsed.data;

  await writeStore((store) => ({
    ...store,
    contactMessages: [
      {
        id: nanoid(),
        name,
        email,
        company: company || undefined,
        motive,
        message,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...store.contactMessages,
    ].slice(0, 200),
  }));

  const mail = await sendContactEmail({
    name,
    email,
    company,
    motive,
    message,
  });

  if (!mail.ok) {
    // Message saved; still report partial success if Resend missing
    return NextResponse.json({
      ok: true,
      warning: mail.error,
    });
  }

  return NextResponse.json({ ok: true });
}
