"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { money } from "@/lib/format";
import type { CartItem } from "@/lib/store/types";

const CART_KEY = "manish3d.cart.v1";

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

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("manish3d-cart-updated"));
}

export function CartView() {
  const cartSnapshot = useSyncExternalStore(subscribe, getCartSnapshot, () => "[]");
  const items = JSON.parse(cartSnapshot) as CartItem[];

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function updateQuantity(id: string, quantity: number) {
    const nextItems = items
      .map((item) => (item.id === id ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    writeCart(nextItems);
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
      <div className="rounded-2xl border border-white/10 bg-[#151317] p-5 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a772ca]">Carrito</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">Tu pedido</h1>

        {items.length ? (
          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <article key={item.id} className="grid gap-4 rounded-xl border border-white/10 bg-[#1d1b20] p-5 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-bold text-white">{item.name}</p>
                  <p className="text-sm text-[#8f8b94]">{money(item.price)}</p>
                </div>
                <input
                  aria-label={`Cantidad de ${item.name}`}
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                  className="w-24 rounded-lg border border-white/10 bg-[#111013] px-3 py-2 text-center font-bold text-white outline-none focus:ring-2 focus:ring-[#8a62ab]"
                />
                <p className="font-black tabular-nums text-[#c49cde]">{money(item.price * item.quantity)}</p>
              </article>
            ))}

            <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-4xl font-black tabular-nums text-white">{money(total)}</p>
              <Link href="/checkout" className="shine-hover rounded-lg bg-[#6f2fa3] px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-[#8544b5]">
                Continuar al checkout
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-white/10 bg-[#1d1b20] p-8 text-[#aaa6ae]">
            <p>El carrito está vacío.</p>
            <Link href="/tienda" className="mt-4 inline-flex rounded-lg bg-[#6f2fa3] px-5 py-3 text-sm font-bold text-white">
              Ver tienda
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
