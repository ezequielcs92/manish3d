import Link from "next/link";
import type { ComponentType } from "react";
import { IconPrinter } from "@/components/admin/icons";
import { PrintJobForm } from "@/components/admin/print-job-form";
import { createMaterial } from "@/lib/admin/actions";
import { isPrintJobStatus, nextStatuses, statusLabel, type PrintJobStatus } from "@/lib/admin/print-queue";
import { togglePrintJobUrgent, updatePrintJobStatus } from "@/lib/admin/print-queue-actions";
import { createClient } from "@/lib/supabase/server";

type PrintJob = {
  id: string;
  name: string;
  material: string;
  color: string;
  quantity: number;
  status: string;
  urgent: boolean;
  estimated_hours: number | null;
  estimated_grams: number | null;
  notes: string | null;
  order_id: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  orders: { client_name: string } | null;
};

const tarjeta = "rounded-3xl border border-[#441a66]/8 bg-white p-7 shadow-[0_10px_30px_rgba(16,9,27,0.05)]";
const campo =
  "w-full rounded-xl border border-[#441a66]/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8a62ab] focus:ring-2 focus:ring-[#8a62ab]/25";

const toneByStatus: Record<PrintJobStatus, string> = {
  en_cola: "bg-amber-50 text-amber-700 ring-amber-200",
  imprimiendo: "bg-[#f1ebf6] text-[#6f2fa3] ring-[#d9c6e8]",
  terminada: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  fallida: "bg-red-50 text-red-700 ring-red-200",
  cancelada: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

/** Texto y estilo de cada botón, según el paso que hace. */
function accion(from: PrintJobStatus, to: PrintJobStatus) {
  const primario = "bg-[#6f2fa3] text-white hover:bg-[#8544b5]";
  const secundario = "bg-[#f5f3f7] text-[#10091b] hover:bg-[#ebe4f1]";
  const peligro = "text-[#c0392b] hover:bg-[#fdecec]";

  if (to === "imprimiendo") return { label: "Empezar", tone: primario };
  if (to === "terminada") return { label: "Terminada", tone: "bg-emerald-600 text-white hover:bg-emerald-700" };
  if (to === "fallida") return { label: "Falló", tone: peligro };
  if (to === "cancelada") return { label: "Cancelar", tone: peligro };
  if (from === "fallida") return { label: "Reintentar", tone: primario };
  if (from === "terminada") return { label: "Reimprimir", tone: secundario };
  return { label: "Volver a la cola", tone: secundario };
}

function fecha(value: string) {
  return new Date(value).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}

function numero(value: number) {
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(value);
}

function StatusPill({ status }: { status: PrintJobStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${toneByStatus[status]}`}>
      {statusLabel[status]}
    </span>
  );
}

function JobCard({ job, compact = false }: { job: PrintJob; compact?: boolean }) {
  if (!isPrintJobStatus(job.status)) return null;
  const status = job.status;
  const detalles = [
    job.estimated_hours ? `${numero(Number(job.estimated_hours))} h` : null,
    job.estimated_grams ? `${numero(Number(job.estimated_grams))} g` : null,
    job.orders ? `Pedido de ${job.orders.client_name}` : null,
  ].filter(Boolean);

  return (
    <article className="rounded-2xl bg-[#faf8fc] p-4 transition hover:bg-[#f5f0f9]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-[#10091b]">
              {job.name} <span className="font-black text-[#6f2fa3]">×{job.quantity}</span>
            </p>
            {job.urgent && status === "en_cola" ? (
              <span className="rounded-full bg-[#fdecec] px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-[#c0392b]">
                Urgente
              </span>
            ) : null}
            {compact ? <StatusPill status={status} /> : null}
          </div>
          <p className="mt-1 text-sm text-[#6b6472]">
            <span className="font-semibold text-[#10091b]">{job.material === "otro" ? "Otro" : job.material}</span> · {job.color}
            {detalles.length ? ` · ${detalles.join(" · ")}` : ""}
          </p>
          {job.notes && !compact ? <p className="mt-2 whitespace-pre-line text-sm text-[#4d4654]">{job.notes}</p> : null}
          <p className="mt-2 text-xs text-[#8b8490]">
            {status === "imprimiendo" && job.started_at
              ? `Empezó ${fecha(job.started_at)}`
              : job.finished_at && status !== "en_cola"
                ? `${statusLabel[status]} ${fecha(job.finished_at)}`
                : `Sumado ${fecha(job.created_at)}`}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {status === "en_cola" ? (
            <form action={togglePrintJobUrgent}>
              <input type="hidden" name="id" value={job.id} />
              <input type="hidden" name="urgent" value={String(!job.urgent)} />
              <button className="rounded-lg px-3 py-2 text-xs font-bold text-[#6b6472] transition hover:bg-[#f1ebf6]">
                {job.urgent ? "Quitar urgente" : "Urgente"}
              </button>
            </form>
          ) : null}
          {nextStatuses[status].map((to) => {
            const { label, tone } = accion(status, to);
            return (
              <form key={to} action={updatePrintJobStatus}>
                <input type="hidden" name="id" value={job.id} />
                <input type="hidden" name="status" value={to} />
                <button className={`rounded-lg px-3 py-2 text-xs font-bold transition ${tone}`}>{label}</button>
              </form>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function Stat({ title, value, tone, Icon }: { title: string; value: string; tone: string; Icon?: ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-[#441a66]/8 bg-white p-5 shadow-[0_10px_30px_rgba(16,9,27,0.05)]">
      <div className="flex items-center gap-3">
        <span className={`rounded-xl p-2.5 ${tone}`}>{Icon ? <Icon className="size-5" /> : null}</span>
        <p className="text-sm font-semibold text-[#6b6472]">{title}</p>
      </div>
      <p className="mt-3 text-3xl font-black tabular-nums text-[#10091b]">{value}</p>
    </div>
  );
}

export default async function ProduccionPage() {
  const supabase = await createClient();
  const [{ data: activos }, { data: historial }, { data: orders }, { data: materials }] = await Promise.all([
    supabase
      .from("print_jobs")
      .select("*, orders(client_name)")
      .in("status", ["en_cola", "imprimiendo", "fallida"])
      .order("urgent", { ascending: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("print_jobs")
      .select("*, orders(client_name)")
      .in("status", ["terminada", "cancelada"])
      .order("finished_at", { ascending: false, nullsFirst: false })
      .limit(15),
    supabase
      .from("orders")
      .select("id, client_name")
      .in("status", ["pendiente", "produccion"])
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("materials")
      .select("id, name, type, color, stock_grams, cost_per_kg, low_stock_threshold")
      .order("name", { ascending: true }),
  ]);

  const jobs = (activos ?? []) as PrintJob[];
  const imprimiendo = jobs.filter((job) => job.status === "imprimiendo");
  const enCola = jobs.filter((job) => job.status === "en_cola");
  const fallidas = jobs.filter((job) => job.status === "fallida");
  const unidadesPendientes = [...enCola, ...imprimiendo].reduce((sum, job) => sum + job.quantity, 0);

  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - 7);
  const terminadasSemana = ((historial ?? []) as PrintJob[]).filter(
    (job) => job.status === "terminada" && job.finished_at && new Date(job.finished_at) >= inicioSemana,
  ).length;

  // Sugerencias para el campo color: los colores ya usados y los de los materiales cargados.
  const colors = [
    ...new Set(
      [...jobs, ...((historial ?? []) as PrintJob[])]
        .map((job) => job.color)
        .concat((materials ?? []).map((material) => material.color ?? ""))
        .map((color) => color.trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "es"));

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8a62ab]">Producción</p>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-[#10091b]">Cola de impresión</h1>
        <p className="mt-2 text-sm text-[#6b6472]">Trabajos internos del taller. No se publican en la tienda.</p>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Imprimiendo" value={String(imprimiendo.length)} tone="bg-[#f1ebf6] text-[#6f2fa3]" Icon={IconPrinter} />
        <Stat title="En cola" value={String(enCola.length)} tone="bg-amber-50 text-amber-600" Icon={IconPrinter} />
        <Stat title="Unidades pendientes" value={String(unidadesPendientes)} tone="bg-sky-50 text-sky-600" Icon={IconPrinter} />
        <Stat title="Terminadas (7 días)" value={String(terminadasSemana)} tone="bg-emerald-50 text-emerald-600" Icon={IconPrinter} />
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <section className={tarjeta}>
            <h2 className="text-xl font-black text-[#10091b]">Imprimiendo ahora</h2>
            <div className="mt-5 flex flex-col gap-3">
              {imprimiendo.length ? (
                imprimiendo.map((job) => <JobCard key={job.id} job={job} />)
              ) : (
                <p className="rounded-2xl bg-[#faf8fc] p-6 text-center text-sm text-[#6b6472]">
                  Ninguna impresora trabajando. Tocá “Empezar” en un trabajo de la cola.
                </p>
              )}
            </div>
          </section>

          <section className={tarjeta}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-[#10091b]">En cola</h2>
              {enCola.length ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  {enCola.length} trabajo{enCola.length === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-[#8b8490]">Los urgentes primero; después, por orden de llegada.</p>
            <div className="mt-5 flex flex-col gap-3">
              {enCola.length ? (
                enCola.map((job) => <JobCard key={job.id} job={job} />)
              ) : (
                <p className="rounded-2xl bg-[#faf8fc] p-6 text-center text-sm text-[#6b6472]">La cola está vacía.</p>
              )}
            </div>
          </section>

          {fallidas.length ? (
            <section className={`${tarjeta} border-red-200`}>
              <h2 className="text-xl font-black text-[#c0392b]">Fallaron</h2>
              <p className="mt-1 text-xs text-[#8b8490]">Reintentalas o cancelalas para sacarlas de acá.</p>
              <div className="mt-5 flex flex-col gap-3">
                {fallidas.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </section>
          ) : null}

          <section className={tarjeta}>
            <h2 className="text-xl font-black text-[#10091b]">Historial</h2>
            <p className="mt-1 text-xs text-[#8b8490]">Últimos 15 trabajos terminados o cancelados.</p>
            <div className="mt-5 flex flex-col gap-3">
              {historial?.length ? (
                (historial as PrintJob[]).map((job) => <JobCard key={job.id} job={job} compact />)
              ) : (
                <p className="rounded-2xl bg-[#faf8fc] p-6 text-center text-sm text-[#6b6472]">Todavía no se terminó ningún trabajo.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-8">
          <section className={tarjeta}>
            <h2 className="text-xl font-black text-[#10091b]">Sumar a la cola</h2>
            <p className="mb-5 mt-1 text-xs text-[#8b8490]">
              Los campos con <span className="text-[#c0392b]">*</span> son obligatorios.
            </p>
            <PrintJobForm colors={colors} orders={orders ?? []} />
          </section>

          <details className={`${tarjeta} group`}>
            <summary className="cursor-pointer text-lg font-black text-[#10091b]">
              Materiales <span className="text-sm font-semibold text-[#8b8490]">({materials?.length ?? 0})</span>
            </summary>
            <div className="mt-5 space-y-3">
              {materials?.map((material) => {
                const lowStock = Number(material.stock_grams) <= Number(material.low_stock_threshold);
                return (
                  <div key={material.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#faf8fc] p-3">
                    <div>
                      <p className="text-sm font-bold">{material.name}</p>
                      <p className="text-xs text-[#6b6472]">
                        {material.type} · {material.color ?? "sin color"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black tabular-nums">{numero(Number(material.stock_grams))} g</p>
                      {lowStock ? <p className="text-xs font-bold text-[#c0392b]">Stock bajo</p> : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <form action={createMaterial} className="mt-5 space-y-3 border-t border-[#441a66]/8 pt-5">
              <p className="text-sm font-bold">Nuevo material</p>
              <input name="name" required placeholder="Nombre" className={campo} />
              <div className="grid grid-cols-2 gap-3">
                <select name="type" defaultValue="PLA" className={campo}>
                  <option value="PLA">PLA</option>
                  <option value="PETG">PETG</option>
                  <option value="TPU">TPU</option>
                  <option value="otro">Otro</option>
                </select>
                <input name="color" placeholder="Color" className={campo} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input name="stock_grams" required type="number" min="0" step="0.01" placeholder="Stock g" className={campo} />
                <input name="cost_per_kg" required type="number" min="0" step="0.01" placeholder="$/kg" className={campo} />
                <input name="low_stock_threshold" required type="number" min="0" step="0.01" placeholder="Alerta g" className={campo} />
              </div>
              <button className="w-full rounded-xl bg-[#10091b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2a1840]">
                Guardar material
              </button>
            </form>
          </details>

          <Link href="/admin/pedidos" className="block text-center text-sm font-bold text-[#6f2fa3]">
            Ver pedidos →
          </Link>
        </aside>
      </div>
    </div>
  );
}
