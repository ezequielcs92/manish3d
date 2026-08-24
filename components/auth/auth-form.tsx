"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "registro";

const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-[#111013] px-4 py-3 font-medium text-white outline-none transition placeholder:text-[#77727c] focus:border-[#8a62ab] focus:ring-2 focus:ring-[#8a62ab]/30";
const labelClass = "block text-xs font-bold uppercase tracking-[0.16em] text-[#8f8b94]";

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

    // Sin confirmación por email, el alta ya deja sesión abierta y entra directo.
    if (mode === "registro" && !result.data.session) {
      setMessage("Cuenta creada. Revisá tu email para confirmarla y después ingresá.");
      return;
    }

    router.push(searchParams.get("redirect") ?? "/cuenta");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mode === "registro" ? (
        <label className={labelClass}>
          Nombre completo
          <input
            required
            name="full_name"
            type="text"
            autoComplete="name"
            placeholder="Como querés que te llamemos"
            className={inputClass}
          />
        </label>
      ) : null}

      <label className={labelClass}>
        Email
        <input
          required
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        Contraseña
        <input
          required
          name="password"
          type="password"
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="Mínimo 6 caracteres"
          className={inputClass}
        />
      </label>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-[#8a62ab]/40 bg-[#6f2fa3]/15 px-4 py-3 text-sm font-semibold text-[#c4a6dd]">
          {message}
        </p>
      ) : null}

      <button
        disabled={isSubmitting}
        className="shine-hover w-full rounded-full bg-[#6f2fa3] px-5 py-3.5 text-sm font-bold text-white shadow-[0_18px_45px_rgba(111,47,163,0.35)] transition hover:bg-[#8a62ab] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Procesando..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
      </button>
    </form>
  );
}
