import { consultHref } from "@/lib/store/contact";
import type { StoreProduct } from "@/lib/store/types";
import { AddToCartButton } from "./add-to-cart-button";

/**
 * Los productos con precio van al carrito; los "a consultar" (precio nulo) se
 * cotizan por WhatsApp y nunca entran al carrito, así no pueden llegar al
 * checkout con un importe que no existe.
 */
export function BuyOrAsk({ product }: { product: StoreProduct }) {
  if (product.price !== null) {
    return <AddToCartButton product={{ ...product, price: product.price }} />;
  }

  const href = consultHref(product.name);

  if (!href) {
    return (
      <p className="w-full rounded-lg border border-white/15 px-5 py-3 text-center text-sm font-bold text-[#b8b5bd]">
        Precio a consultar
      </p>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="shine-hover block w-full rounded-lg border border-[#8a62ab] bg-[#6f2fa3]/15 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[#6f2fa3]/30"
    >
      Consultar por WhatsApp
    </a>
  );
}
