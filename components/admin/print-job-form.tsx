"use client";

import { useActionState } from "react";
import { addPrintJob, type PrintJobFormState } from "@/lib/admin/print-queue-actions";
import { printMaterials } from "@/lib/admin/print-queue";
import { IconPlus } from "./icons";

const campo =
  "w-full rounded-xl border border-[#441a66]/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8a62ab] focus:ring-2 focus:ring-[#8a62ab]/25";
const etiqueta = "mb-1.5 block text-sm font-bold text-[#10091b]";

export type OrderOption = { id: string; client_name: string };

export function PrintJobForm({ colors, orders }: { colors: string[]; orders: OrderOption[] }) {
  const [state, formAction, guardando] = useActionState<PrintJobFormState, FormData>(addPrintJob, {});
  const v = state.values ?? {};

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Sumado a la cola.</p>
      ) : null}

      <div>
        <label htmlFor="pj-name" className={etiqueta}>
          Qué imprimir <span className="text-[#c0392b]">*</span>
        </label>
        <input id="pj-name" name="name" required defaultValue={v.name} placeholder="Ej: Cubo infinito chico" className={campo} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pj-material" className={etiqueta}>
            Material <span className="text-[#c0392b]">*</span>
          </label>
          <select id="pj-material" name="material" required defaultValue={v.material ?? "PLA"} className={campo}>
            {printMaterials.map((material) => (
              <option key={material} value={material}>
                {material === "otro" ? "Otro" : material}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pj-quantity" className={etiqueta}>
            Unidades <span className="text-[#c0392b]">*</span>
          </label>
          <input
            id="pj-quantity"
            name="quantity"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={v.quantity ?? "1"}
            className={campo}
          />
        </div>
      </div>

      <div>
        <label htmlFor="pj-color" className={etiqueta}>
          Color <span className="text-[#c0392b]">*</span>
        </label>
        <input id="pj-color" name="color" required list="pj-colores" defaultValue={v.color} placeholder="Ej: Violeta" className={campo} />
        <datalist id="pj-colores">
          {colors.map((color) => (
            <option key={color} value={color} />
          ))}
        </datalist>
      </div>

      <details className="group rounded-xl bg-[#faf8fc] px-4 py-3" open={Boolean(v.notes || v.order_id || v.estimated_hours || v.estimated_grams)}>
        <summary className="cursor-pointer text-sm font-bold text-[#6f2fa3]">Más datos (opcional)</summary>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pj-hours" className={etiqueta}>
                Horas estimadas
              </label>
              <input id="pj-hours" name="estimated_hours" inputMode="decimal" defaultValue={v.estimated_hours} placeholder="Ej: 2,5" className={campo} />
            </div>
            <div>
              <label htmlFor="pj-grams" className={etiqueta}>
                Gramos
              </label>
              <input id="pj-grams" name="estimated_grams" inputMode="decimal" defaultValue={v.estimated_grams} placeholder="Ej: 120" className={campo} />
            </div>
          </div>
          {orders.length ? (
            <div>
              <label htmlFor="pj-order" className={etiqueta}>
                Pedido
              </label>
              <select id="pj-order" name="order_id" defaultValue={v.order_id ?? ""} className={campo}>
                <option value="">Sin pedido</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.client_name} · #{order.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label htmlFor="pj-notes" className={etiqueta}>
              Notas
            </label>
            <textarea id="pj-notes" name="notes" rows={3} defaultValue={v.notes} placeholder="Relleno, boquilla, archivo…" className={`${campo} resize-y`} />
          </div>
        </div>
      </details>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-[#10091b]">
        <input type="checkbox" name="urgent" defaultChecked={v.urgent === "on"} className="size-4 accent-[#6f2fa3]" />
        Urgente (va primero en la cola)
      </label>

      <button
        disabled={guardando}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6f2fa3] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#8544b5] disabled:opacity-60"
      >
        <IconPlus className="size-4" /> {guardando ? "Sumando…" : "Sumar a la cola"}
      </button>
    </form>
  );
}
