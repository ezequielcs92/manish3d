"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  IconBag,
  IconBox,
  IconCalculator,
  IconDashboard,
  IconPrinter,
  IconUndo,
  IconUsers,
  IconWallet,
} from "./icons";

type NavItem = {
  label: string;
  href: string;
  roles: string[];
  Icon: ComponentType<{ className?: string }>;
};

const ALL = ["superadmin", "admin_operativo", "vendedor"];
const GESTION = ["superadmin", "admin_operativo"];

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: "Operaciones",
    items: [
      { label: "Dashboard", href: "/admin", roles: ALL, Icon: IconDashboard },
      { label: "Pedidos", href: "/admin/pedidos", roles: ALL, Icon: IconBag },
      { label: "Productos", href: "/admin/productos", roles: GESTION, Icon: IconBox },
      { label: "Clientes", href: "/admin/clientes", roles: ALL, Icon: IconUsers },
      { label: "Producción", href: "/admin/produccion", roles: GESTION, Icon: IconPrinter },
    ],
  },
  {
    title: "Gestión",
    items: [
      { label: "Finanzas", href: "/admin/finanzas", roles: GESTION, Icon: IconWallet },
      { label: "Calculadora", href: "/admin/calculadora", roles: ALL, Icon: IconCalculator },
      { label: "Arrepentimientos", href: "/admin/solicitudes", roles: ALL, Icon: IconUndo },
    ],
  },
];

export function AdminNav({ role }: { role: string }) {
  const pathname = usePathname();

  // "/admin" solo se marca en la portada; el resto también en sus subpáginas,
  // así "Productos" queda activo mientras se edita un producto.
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      {sections.map((section) => {
        const visibles = section.items.filter((item) => item.roles.includes(role));
        if (!visibles.length) return null;

        return (
          <div key={section.title} className="mb-4">
            <p className="px-6 pb-2 pt-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white/35">
              {section.title}
            </p>
            {visibles.map(({ label, href, Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`mx-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[#6f2fa3] text-white shadow-[0_10px_30px_rgba(111,47,163,0.35)]"
                      : "text-white/60 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className="size-[1.1rem] shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
