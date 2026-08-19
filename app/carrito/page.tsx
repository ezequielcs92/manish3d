import { CartView } from "@/components/tienda/cart-view";
import { StoreFooter } from "@/components/tienda/store-footer";
import { StoreHeader } from "@/components/tienda/store-header";

export default function CarritoPage() {
  return (
    <main className="min-h-screen bg-[#0d0c0f] text-white">
      <StoreHeader />
      <CartView />
      <StoreFooter />
    </main>
  );
}
