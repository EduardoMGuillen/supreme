import { Resend } from "resend";
import type { ContactMotive } from "./types";

const MOTIVE_LABEL: Record<ContactMotive, string> = {
  contacto: "Contacto",
  patrocinio: "Patrocinio",
  colaboracion: "Colaboración",
};

export async function sendContactEmail(input: {
  name: string;
  email: string;
  company?: string;
  motive: ContactMotive;
  message: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || "soysupremohn@gmail.com";
  const from =
    process.env.CONTACT_FROM_EMAIL || "Supremo Web <onboarding@resend.dev>";

  if (!apiKey) {
    return {
      ok: false,
      error:
        "RESEND_API_KEY no configurada. El mensaje se guardó en el panel admin.",
    };
  }

  const resend = new Resend(apiKey);
  const label = MOTIVE_LABEL[input.motive];
  const subject = `[${label}] ${input.name} — soysupremohn.com`;

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: input.email,
    subject,
    text: [
      `Motivo: ${label}`,
      `Nombre: ${input.name}`,
      `Email: ${input.email}`,
      input.company ? `Empresa/marca: ${input.company}` : null,
      "",
      input.message,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
