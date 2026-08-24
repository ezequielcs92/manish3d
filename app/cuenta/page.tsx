import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/cuenta/profile-form";
import { StatusBadge } from "@/components/cuenta/status-badge";
import { StoreFooter } from "@/components/tienda/store-footer";
import { StoreHeader } from "@/components/tienda/store-header";
import { signOut } from "@/lib/cuenta/actions";
import { money } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mi cuenta | Manish 3D",
  description: "Tus datos, tus envíos y el estado de tus pedidos.",
};

export const dynamic = "force-dynamic";

const STAFF_ROLES = ["superadmin", "admin_operativo", "vendedor"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export default async function CuentaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=%2Fcuenta");

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("users").select("full_name, email, phone, shipping_address, role, created_at").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("id, status, payment_status, total, created_at")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const address = (profile?.shipping_address ?? {}) as { street?: string; zone?: string; notes?: string };
  const displayName = profile?.full_name?.trim() || user.email?.split("@")[0] || "Hola";
  const isStaff = STAFF_ROLES.includes(profile?.role ?? "");

  return (
    <main className="min-h-screen bg-[#0d0c0f] text-white">
      <StoreHeader />

      <section className="border-b border-white/10 bg-[#151317]">
        <div className="mx-auto max-w-[70rem] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a772ca]">Mi cuenta</p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.05em] sm:text-6xl">{displayName}</h1>
              <p className="mt-3 text-sm text-[#8f8b94]">
                {profile?.email ?? user.email}
                {profile?.created_at ? ` · cliente desde ${formatDate(profile.created_at)}` : null}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {isStaff ? (
                <Link
                  href="/admin"
                  className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold transition hover:border-[#8a62ab] hover:bg-[#6f2fa3]/15"
                >
                  Panel interno
                </Link>
              ) : null}
              <form action={signOut}>
                <button className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-[#b8b5bd] transition hover:border-red-400/40 hover:text-white">
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[70rem] gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-14">
        <section className="rounded-[2rem] border border-white/10 bg-[#151317] p-6 sm:p-8">
          <h2 className="text-2xl font-black tracking-[-0.03em]">Tus datos</h2>
          <p className="mt-2 text-sm text-[#8f8b94]">
            Los usamos para preparar el envío. Quedan cargados para tu próxima compra.
          </p>
          <div className="mt-7">
            <ProfileForm
              values={{
                fullName: profile?.full_name ?? "",
                phone: profile?.phone ?? "",
                street: address.street ?? "",
                zone: address.zone ?? "",
                notes: address.notes ?? "",
              }}
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#151317] p-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-black tracking-[-0.03em]">Tus pedidos</h2>
            <Link href="/tienda" className="text-sm font-bold text-[#a772ca] transition hover:text-white">
              Seguir comprando →
            </Link>
          </div>

          {orders?.length ? (
            <div className="mt-6 divide-y divide-white/10">
              {orders.map((order) => (
                <article key={order.id} className="grid gap-3 py-5 first:pt-0 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <Link href={`/pedido/${order.id}`} className="font-bold transition hover:text-[#a772ca]">
                      Pedido #{order.id.slice(0, 8)}
                    </Link>
                    <p className="mt-1 text-sm text-[#8f8b94]">
                      {formatDate(order.created_at)} · {money(Number(order.total))}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <StatusBadge status={order.status} />
                    <StatusBadge status={order.payment_status} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center">
              <p className="font-bold">Todavía no hiciste ningún pedido.</p>
              <p className="mt-2 text-sm text-[#8f8b94]">Cuando compres, vas a poder seguir el estado desde acá.</p>
              <Link
                href="/tienda"
                className="shine-hover mt-5 inline-flex rounded-full bg-[#6f2fa3] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_45px_rgba(111,47,163,0.35)] transition hover:bg-[#8a62ab]"
              >
                Ver la tienda
              </Link>
            </div>
          )}
        </section>
      </div>

      <StoreFooter />
    </main>
  );
}
