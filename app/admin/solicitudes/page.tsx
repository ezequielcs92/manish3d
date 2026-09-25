import { resolveRetraction } from "@/lib/admin/actions";
import { createClient } from "@/lib/supabase/server";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

/** Días hábiles no: la ley cuenta corridos, y 10 es el tope para arrepentirse. */
function diasDesde(value: string) {
  return Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
}

export default async function SolicitudesPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("retraction_requests")
    .select("id, full_name, email, phone, order_reference, reason, status, created_at")
    .order("created_at", { ascending: false });

  const pendientes = requests?.filter((item) => item.status === "pendiente") ?? [];

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-[#441a66]/10 bg-white p-6 shadow-[0_18px_60px_rgba(16,9,27,0.07)]">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8a62ab]">Legales</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#441a66]">Arrepentimientos</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#545454]">
          Solicitudes de cancelación recibidas por el botón de arrepentimiento. La ley da 10 días corridos al cliente y
          espera una respuesta rápida de nuestro lado.
        </p>
        {pendientes.length ? (
          <p className="mt-4 inline-flex rounded-full bg-[#fbeaea] px-4 py-2 text-sm font-bold text-[#a11b1b]">
            {pendientes.length} sin resolver
          </p>
        ) : null}
      </header>

      <section className="rounded-[2rem] border border-[#441a66]/10 bg-white p-6 shadow-[0_18px_60px_rgba(16,9,27,0.07)]">
        <div className="divide-y divide-[#441a66]/10">
          {requests?.length ? (
            requests.map((request) => (
              <article key={request.id} className="grid gap-3 py-5 first:pt-0 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-bold text-[#10091b]">{request.full_name}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        request.status === "pendiente"
                          ? "bg-[#fbeaea] text-[#a11b1b]"
                          : "bg-[#e8f3ec] text-[#1c6b3f]"
                      }`}
                    >
                      {request.status}
                    </span>
                    <span className="text-xs text-[#6b6472]">
                      {formatDate(request.created_at)} · hace {diasDesde(request.created_at)} días
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#545454]">
                    {request.email}
                    {request.phone ? ` · ${request.phone}` : ""}
                    {request.order_reference ? ` · pedido ${request.order_reference}` : ""}
                  </p>
                  {request.reason ? (
                    <p className="mt-2 max-w-2xl rounded-2xl bg-[#faf7fc] p-3 text-sm text-[#545454]">{request.reason}</p>
                  ) : null}
                </div>

                {request.status === "pendiente" ? (
                  <form action={resolveRetraction}>
                    <input type="hidden" name="id" value={request.id} />
                    <button className="rounded-full bg-[#441a66] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#6f2fa3]">
                      Marcar resuelta
                    </button>
                  </form>
                ) : null}
              </article>
            ))
          ) : (
            <p className="py-8 text-sm text-[#545454]">No hay solicitudes de arrepentimiento.</p>
          )}
        </div>
      </section>
    </div>
  );
}
