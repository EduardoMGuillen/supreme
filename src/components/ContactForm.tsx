"use client";

import { useState } from "react";
import type { ContactMotive } from "@/lib/types";

const MOTIVES: { value: ContactMotive; label: string }[] = [
  { value: "contacto", label: "Contacto general" },
  { value: "patrocinio", label: "Patrocinio" },
  { value: "colaboracion", label: "Colaboración" },
];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      company: String(data.get("company") || ""),
      motive: String(data.get("motive") || "contacto"),
      message: String(data.get("message") || ""),
      website: String(data.get("website") || ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(json.error || "No se pudo enviar. Intenta de nuevo.");
        return;
      }
      setStatus("ok");
      setMessage("Mensaje enviado. Te respondemos pronto.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Error de red. Intenta de nuevo.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 max-w-xl">
      <div>
        <label className="label" htmlFor="motive">
          Motivo
        </label>
        <select id="motive" name="motive" className="select" required defaultValue="contacto">
          {MOTIVES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="name">
          Nombre
        </label>
        <input id="name" name="name" className="input" required maxLength={120} />
      </div>

      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          required
          maxLength={160}
        />
      </div>

      <div>
        <label className="label" htmlFor="company">
          Empresa / marca (opcional)
        </label>
        <input id="company" name="company" className="input" maxLength={160} />
      </div>

      <div>
        <label className="label" htmlFor="message">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          className="textarea"
          required
          maxLength={4000}
        />
      </div>

      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <button
        type="submit"
        className="btn w-fit"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Enviando…" : "Enviar"}
      </button>

      {message ? (
        <p
          className={
            status === "ok" ? "text-[var(--ok)] text-sm" : "text-[var(--danger)] text-sm"
          }
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
