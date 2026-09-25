"use client";

import { useState } from "react";
import type { StoreProduct } from "@/lib/store/types";

const CART_KEY = "manish3d.cart.v1";

export function AddToCartButton({ product }: { product: StoreProduct & { price: number } }) {
  const [added, setAdded] = useState(false);

  function addToCart() {
    const raw = window.localStorage.getItem(CART_KEY);
    const items = raw ? JSON.parse(raw) : [];
    const existing = items.find((item: StoreProduct & { quantity: number }) => item.id === product.id);

    const nextItems = existing
      ? items.map((item: StoreProduct & { quantity: number }) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      : [...items, { ...product, quantity: 1 }];

    window.localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new Event("manish3d-cart-updated"));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={addToCart}
      className="shine-hover w-full rounded-lg bg-[#6f2fa3] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#8544b5] active:translate-y-px"
    >
      {added ? "Listo, agregado" : "Agregar"}
    </button>
  );
}
