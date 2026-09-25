import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/lib/cuenta/actions";
import { AdminNav } from "./admin-nav";
import { IconLogout, IconStore } from "./icons";

const roleLabel: Record<string, string> = {
  superadmin: "Superadmin",
  admin_operativo: "Admin operativo",
  vendedor: "Vendedor",
};

export function PanelShell({
  children,
  userLabel,
  role,
}: {
  children: React.ReactNode;
  userLabel: string;
  role: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f3f7] text-[#10091b] lg:flex-row">
      {/* Menú lateral de borde a borde y fijo en desktop, como en el panel de Easter Egg. */}
      <aside className="flex shrink-0 flex-col bg-[#10091b] text-white lg:sticky lg:top-0 lg:h-screen lg:w-64">
        <Link href="/admin" className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <Image src="/brand/logo-header-exact.png" alt="Manish 3D" width={150} height={26} className="h-auto w-32" unoptimized />
          <span className="rounded-md bg-[#6f2fa3]/30 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#c49cde]">
            Admin
          </span>
        </Link>

        <AdminNav role={role} />

        <div className="border-t border-white/10 px-6 py-5">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white/35">Sesión</p>
          <p className="mt-1.5 truncate text-sm font-bold">{userLabel}</p>
          <p className="text-xs text-white/50">{roleLabel[role] ?? role}</p>
          <div className="mt-4 flex flex-col gap-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white"
            >
              <IconStore className="size-4" /> Ver tienda
            </Link>
            <form action={signOut}>
              <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#f19999] transition hover:bg-white/8">
                <IconLogout className="size-4" /> Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}
