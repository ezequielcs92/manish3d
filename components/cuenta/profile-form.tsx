"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/lib/cuenta/actions";

const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-[#111013] px-4 py-3 font-medium text-white outline-none transition placeholder:text-[#77727c] focus:border-[#8a62ab] focus:ring-2 focus:ring-[#8a62ab]/30";
const labelClass = "block text-xs font-bold uppercase tracking-[0.16em] text-[#8f8b94]";

export type ProfileValues = {
  fullName: string;
  phone: string;
  street: string;
  zone: string;
  notes: string;
};

export function ProfileForm({ values }: { values: ProfileValues }) {
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(updateProfile, {});

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Nombre completo
          <input required name="full_name" type="text" autoComplete="name" defaultValue={values.fullName} className={inputClass} />
        </label>
        <label className={labelClass}>
          Teléfono
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="11 5555 5555"
            defaultValue={values.phone}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Dirección
          <input
            name="street"
            type="text"
            autoComplete="street-address"
            placeholder="Calle y número"
            defaultValue={values.street}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Zona o localidad
          <input
            name="zone"
            type="text"
            autoComplete="address-level2"
            placeholder="Ej: Vicente López"
            defaultValue={values.zone}
            className={inputClass}
          />
        </label>
      </div>

      <label className={labelClass}>
        Referencias para la entrega
        <textarea
          name="notes"
          rows={3}
          placeholder="Timbre, horarios, entre qué calles…"
          defaultValue={values.notes}
          className={`${inputClass} resize-none`}
        />
      </label>

      {state.error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-lg border border-[#8a62ab]/40 bg-[#6f2fa3]/15 px-4 py-3 text-sm font-semibold text-[#c4a6dd]">
          {state.message}
        </p>
      ) : null}

      <button
        disabled={isPending}
        className="shine-hover rounded-full bg-[#6f2fa3] px-6 py-3 text-sm font-bold text-white shadow-[0_18px_45px_rgba(111,47,163,0.35)] transition hover:bg-[#8a62ab] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
