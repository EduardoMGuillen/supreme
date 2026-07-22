"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: fd.get("username"),
        password: fd.get("password"),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Credenciales inválidas");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg-muted">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm border border-ink bg-bg p-8 grid gap-4"
      >
        <h1 className="font-display text-3xl tracking-wide">Admin</h1>
        <p className="text-sm text-ink-soft -mt-2">Supremo · panel</p>
        <div>
          <label className="label" htmlFor="username">
            Usuario
          </label>
          <input id="username" name="username" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            required
          />
        </div>
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
