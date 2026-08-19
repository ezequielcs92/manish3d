"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "registro";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("full_name") ?? "");
    const supabase = createClient();

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "registro") {
      setMessage("Cuenta creada. Revisá tu email si Supabase requiere confirmación.");
      return;
    }

    router.push(searchParams.get("redirect") ?? "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "registro" ? (
        <label className="block text-sm font-medium text-zinc-700">
          Nombre completo
          <input
            name="full_name"
            type="text"
            autoComplete="name"
            className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none ring-orange-600 transition focus:ring-2"
          />
        </label>
      ) : null}

      <label className="block text-sm font-medium text-zinc-700">
        Email
        <input
          required
          name="email"
          type="email"
          autoComplete="email"
          className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none ring-orange-600 transition focus:ring-2"
        />
      </label>

      <label className="block text-sm font-medium text-zinc-700">
        Contraseña
        <input
          required
          name="password"
          type="password"
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none ring-orange-600 transition focus:ring-2"
        />
      </label>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="text-sm font-medium text-green-700">{message}</p> : null}

      <button
        disabled={isSubmitting}
        className="w-full rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Procesando..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
      </button>
    </form>
  );
}
