import { CheckoutView } from "@/components/tienda/checkout-view";
import { StoreFooter } from "@/components/tienda/store-footer";
import { StoreHeader } from "@/components/tienda/store-header";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#0d0c0f] text-white">
      <StoreHeader />
      <CheckoutView />
      <StoreFooter />
    </main>
  );
}
