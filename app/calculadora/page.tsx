import type { Metadata } from "next";
import { PriceCalculator } from "@/components/calculadora/price-calculator";
import { StoreFooter } from "@/components/tienda/store-footer";
import { StoreHeader } from "@/components/tienda/store-header";

export const metadata: Metadata = {
  title: "Calculadora de impresión 3D: costo y precio de venta | Manish 3D",
  description:
    "Calculá gratis el costo y el precio de venta de tus impresiones 3D: filamento, electricidad, tiempo de máquina, desgaste, riesgo de falla y margen.",
};

export default function CalculadoraPage() {
  return (
    <main className="min-h-screen bg-[#0d0c0f] text-white">
      <StoreHeader />
      <section className="border-b border-white/10 bg-[#151317]">
        <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a772ca]">Herramientas Manish 3D</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-6xl">Calculadora de precios 3D</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8f8b94] sm:text-base">
            Poné tiempo, peso y material para saber cuánto te cuesta una pieza y cuánto conviene cobrarla.
          </p>
        </div>
      </section>
      <PriceCalculator variant="dark" />
      <StoreFooter />
    </main>
  );
}
