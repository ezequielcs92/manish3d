import Image from "next/image";
import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/admin", roles: ["superadmin", "admin_operativo", "vendedor"] },
  { label: "Pedidos", href: "/admin/pedidos", roles: ["superadmin", "admin_operativo", "vendedor"] },
  { label: "Productos", href: "/admin/productos", roles: ["superadmin", "admin_operativo"] },
  { label: "Clientes", href: "/admin/clientes", roles: ["superadmin", "admin_operativo", "vendedor"] },
  { label: "Producción", href: "/admin/produccion", roles: ["superadmin", "admin_operativo"] },
  { label: "Finanzas", href: "/admin/finanzas", roles: ["superadmin", "admin_operativo"] },
  { label: "Calculadora", href: "/admin/calculadora", roles: ["superadmin", "admin_operativo", "vendedor"] },
];

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
    <main className="brand-grid min-h-screen bg-[#f8f8f8] text-[#10091b]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:py-6">
        <aside className="rounded-[2rem] border border-white/10 bg-[#10091b] p-4 text-white shadow-[0_28px_90px_rgba(16,9,27,0.22)] lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72">
          <Link href="/admin" className="block rounded-[1.5rem] bg-white p-4 text-[#10091b] shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
            <Image src="/brand/logo-horizontal.png" alt="Manish 3D" width={170} height={48} className="h-auto w-40" />
            <span className="mt-4 block text-xs font-bold uppercase tracking-[0.28em] text-[#8a62ab]">
              Mesa de taller
            </span>
            <span className="mt-1 block text-lg font-black">Panel interno</span>
          </Link>

          <nav className="mt-5 grid gap-1">
            {navItems
              .filter((item) => item.roles.includes(role))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 text-sm font-bold text-white/68 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
          </nav>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8a62ab]">Sesión</p>
            <p className="mt-2 truncate text-sm font-bold">{userLabel}</p>
            <p className="mt-1 text-xs text-white/55">{role}</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}
