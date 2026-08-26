"use client";

import { useActionState } from "react";
import { submitRetraction, type RetractionState } from "@/lib/legal/actions";

const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-[#111013] px-4 py-3 font-medium text-white outline-none transition placeholder:text-[#77727c] focus:border-[#8a62ab] focus:ring-2 focus:ring-[#8a62ab]/30";
const labelClass = "block text-xs font-bold uppercase tracking-[0.16em] text-[#8f8b94]";

export function RetractionForm() {
  const [state, formAction, isPending] = useActionState<RetractionState, FormData>(submitRetraction, {});

  if (state.message) {
    return (
      <div className="rounded-2xl border border-[#8a62ab]/40 bg-[#6f2fa3]/12 p-6">
        <p className="text-lg font-black text-white">Solicitud registrada</p>
        <p className="mt-2 text-sm leading-7 text-[#b8b5bd]">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Nombre y apellido
          <input required name="full_name" type="text" autoComplete="name" className={inputClass} />
        </label>
        <label className={labelClass}>
          Email
          <input required name="email" type="email" autoComplete="email" className={inputClass} />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Teléfono <span className="normal-case tracking-normal text-[#68656c]">(opcional)</span>
          <input name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </label>
        <label className={labelClass}>
          Número de pedido <span className="normal-case tracking-normal text-[#68656c]">(opcional)</span>
          <input name="order_reference" type="text" placeholder="Lo ves en tu cuenta" className={inputClass} />
        </label>
      </div>

      <label className={labelClass}>
        Comentario <span className="normal-case tracking-normal text-[#68656c]">(opcional)</span>
        <textarea
          name="reason"
          rows={3}
          placeholder="No hace falta que expliques nada, pero si querés contarnos algo, te leemos."
          className={`${inputClass} resize-none`}
        />
      </label>

      {state.error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        disabled={isPending}
        className="shine-hover w-full rounded-full bg-[#6f2fa3] px-6 py-3.5 text-sm font-bold text-white shadow-[0_18px_45px_rgba(111,47,163,0.35)] transition hover:bg-[#8a62ab] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Enviando..." : "Enviar solicitud de arrepentimiento"}
      </button>
    </form>
  );
}
