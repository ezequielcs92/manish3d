"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { money } from "@/lib/format";
import type { CartItem } from "@/lib/store/types";

const CART_KEY = "manish3d.cart.v1";
const inputClass = "rounded-lg border border-white/10 bg-[#111013] px-4 py-3 font-medium text-white outline-none transition placeholder:text-[#77727c] focus:border-[#8a62ab] focus:ring-2 focus:ring-[#8a62ab]/30";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("manish3d-cart-updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("manish3d-cart-updated", callback);
  };
}

function getCartSnapshot() {
  return JSON.stringify(readCart());
}

export type CheckoutDefaults = {
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  street?: string;
  zone?: string;
};

export function CheckoutView({ defaults = {} }: { defaults?: CheckoutDefaults }) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cartSnapshot = useSyncExternalStore(subscribe, getCartSnapshot, () => "[]");
  const items = JSON.parse(cartSnapshot) as CartItem[];

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: String(formData.get("client_name") ?? ""),
        clientPhone: String(formData.get("client_phone") ?? ""),
        clientEmail: String(formData.get("client_email") ?? ""),
        shippingAddress: {
          street: String(formData.get("street") ?? ""),
          zone: String(formData.get("zone") ?? ""),
          notes: String(formData.get("notes") ?? ""),
        },
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
      }),
    });

    const result = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(result.error ?? "No se pudo crear el checkout.");
      return;
    }

    window.localStorage.removeItem(CART_KEY);
    window.location.assign(result.initPoint ?? `/pedido/${result.orderId}`);
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_24rem] lg:py-16">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-[#151317] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a772ca]">Checkout</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">Datos del pedido</h1>
        <p className="mt-3 max-w-2xl text-[#8f8b94]">Completá tus datos y te llevamos a MercadoPago. Después podés seguir el estado del pedido en tiempo real.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <input required name="client_name" placeholder="Nombre y apellido" defaultValue={defaults.clientName ?? ""} className={inputClass} />
          <input required name="client_phone" placeholder="WhatsApp" defaultValue={defaults.clientPhone ?? ""} className={inputClass} />
          <input required name="client_email" type="email" placeholder="Email" defaultValue={defaults.clientEmail ?? ""} className={inputClass} />
          <input name="zone" placeholder="Zona / localidad" defaultValue={defaults.zone ?? ""} className={inputClass} />
          <input name="street" placeholder="Dirección de entrega" defaultValue={defaults.street ?? ""} className={`${inputClass} sm:col-span-2`} />
          <textarea name="notes" placeholder="Notas para producción o entrega" className={`${inputClass} min-h-28 sm:col-span-2`} />
        </div>

        {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}

        <button
          disabled={!items.length || isSubmitting}
          className="shine-hover mt-6 w-full rounded-lg bg-[#6f2fa3] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#8544b5] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creando checkout..." : "Pagar con MercadoPago"}
        </button>
      </form>

      <aside className="rounded-2xl border border-white/10 bg-[#1d1b20] p-6 text-white lg:sticky lg:top-36 lg:self-start">
        <h2 className="text-2xl font-black tracking-tight">Resumen</h2>
        <div className="mt-5 divide-y divide-white/10">
          {items.length ? (
            items.map((item) => (
              <div key={item.id} className="py-3">
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-white/60">{item.quantity} x {money(item.price)}</p>
              </div>
            ))
          ) : (
            <p className="py-4 text-sm text-white/60">Tu carrito está vacío.</p>
          )}
        </div>
        <p className="mt-5 border-t border-white/10 pt-5 text-4xl font-black tabular-nums text-white">
          {money(total)}
        </p>
      </aside>
    </section>
  );
}
