import Link from "next/link";
import { PriceCalculator } from "@/components/calculadora/price-calculator";

export default function AdminCalculadoraPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-[#441a66]/10 bg-white p-6 shadow-[0_18px_60px_rgba(16,9,27,0.07)]">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8a62ab]">Herramientas</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[#441a66]">Calculadora de precios</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#545454]">
              Costo real y precio sugerido de cada impresión: filamento, luz, desgaste de máquina, mano de obra, riesgo
              de falla y margen.
            </p>
          </div>
          <Link
            href="/calculadora"
            className="rounded-full bg-[#441a66] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[#6f2fa3]"
          >
            Ver versión pública
          </Link>
        </div>
      </header>

      <div className="overflow-hidden rounded-[2rem] border border-[#441a66]/10 bg-white shadow-[0_18px_60px_rgba(16,9,27,0.07)]">
        <PriceCalculator variant="light" />
      </div>
    </div>
  );
}
