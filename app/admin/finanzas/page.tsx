import { createTransaction } from "@/lib/admin/actions";
import { createClient } from "@/lib/supabase/server";

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function FinanzasPage() {
  const supabase = await createClient();
  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, type, amount, description, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const income = transactions?.filter((item) => item.type === "ingreso").reduce((sum, item) => sum + Number(item.amount), 0) ?? 0;
  const costs = transactions?.filter((item) => item.type !== "ingreso").reduce((sum, item) => sum + Number(item.amount), 0) ?? 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <section className="rounded-[2rem] border border-black/10 bg-[#fbf4ea] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a15f1b]">Finanzas</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Caja operativa</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-black/10 bg-[#fff8ef] p-4">
            <p className="text-sm text-[#6f5845]">Ingresos</p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{money(income)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 bg-[#fff8ef] p-4">
            <p className="text-sm text-[#6f5845]">Costos/gastos</p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{money(costs)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 bg-[#fff8ef] p-4">
            <p className="text-sm text-[#6f5845]">Saldo operativo</p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{money(income - costs)}</p>
          </div>
        </div>

        <div className="mt-6 divide-y divide-black/10">
          {transactions?.length ? (
            transactions.map((transaction) => (
              <article key={transaction.id} className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="font-semibold">{transaction.type}</p>
                  <p className="text-sm text-[#6f5845]">{transaction.description ?? "sin descripción"}</p>
                </div>
                <span className="font-mono text-sm font-semibold tabular-nums">{money(Number(transaction.amount))}</span>
              </article>
            ))
          ) : (
            <p className="py-8 text-sm text-[#6f5845]">No hay movimientos cargados.</p>
          )}
        </div>
      </section>

      <aside className="rounded-[2rem] border border-black/10 bg-[#fbf4ea] p-6 xl:self-start">
        <h2 className="text-2xl font-semibold">Nuevo movimiento</h2>
        <form action={createTransaction} className="mt-5 space-y-4">
          <select name="type" className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]">
            <option value="ingreso">Ingreso</option>
            <option value="costo_material">Costo material</option>
            <option value="gasto_operativo">Gasto operativo</option>
          </select>
          <input name="amount" required type="number" min="0" step="0.01" placeholder="Monto" className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          <textarea name="description" placeholder="Descripción" className="min-h-28 w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          <button className="w-full rounded-full bg-[#21170f] px-5 py-3 text-sm font-semibold text-[#fff7ed] transition hover:bg-[#3a2a1e]">Guardar movimiento</button>
        </form>
      </aside>
    </div>
  );
}
