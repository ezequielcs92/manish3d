"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { bulkUpdateProducts, type BulkAction } from "@/lib/admin/product-actions";
import { getLine, productLines } from "@/lib/store/lines";
import type { AdminProduct } from "./product-form";

const POR_PAGINA = 20;

const money = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);

const control =
  "rounded-xl border border-[#441a66]/15 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#8a62ab] focus:ring-2 focus:ring-[#8a62ab]/25";

const acciones: { valor: BulkAction; texto: string; pide?: "precio" | "stock" }[] = [
  { valor: "activar", texto: "Mostrar en la tienda" },
  { valor: "ocultar", texto: "Ocultar de la tienda" },
  { valor: "precio", texto: "Fijar precio", pide: "precio" },
  { valor: "consultar", texto: "Pasar a “a consultar”" },
  { valor: "stock", texto: "Fijar stock", pide: "stock" },
];

export function ProductsTable({ products, estadoInicial }: { products: AdminProduct[]; estadoInicial?: string }) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [linea, setLinea] = useState("");
  const [estado, setEstado] = useState(estadoInicial ?? "");
  const [pagina, setPagina] = useState(1);
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [accion, setAccion] = useState<BulkAction | "">("");
  const [valor, setValor] = useState("");
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [aplicando, startTransition] = useTransition();

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return products.filter((product) => {
      if (termino && !product.name.toLowerCase().includes(termino) && !product.slug.includes(termino)) return false;
      if (linea && product.line !== linea && !product.extra_lines?.includes(linea)) return false;
      if (estado === "activos" && !product.active) return false;
      if (estado === "ocultos" && product.active) return false;
      if (estado === "consultar" && product.price !== null) return false;
      if (estado === "sin-fotos" && product.images?.length) return false;
      return true;
    });
  }, [products, busqueda, linea, estado]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);
  const todosMarcados = visibles.length > 0 && visibles.every((product) => seleccion.has(product.id));
  const accionElegida = acciones.find((item) => item.valor === accion);

  function filtrar(cambio: () => void) {
    cambio();
    setPagina(1);
    setSeleccion(new Set());
  }

  function alternar(id: string) {
    setSeleccion((actual) => {
      const nueva = new Set(actual);
      if (nueva.has(id)) nueva.delete(id);
      else nueva.add(id);
      return nueva;
    });
  }

  function alternarPagina() {
    setSeleccion((actual) => {
      const nueva = new Set(actual);
      visibles.forEach((product) => (todosMarcados ? nueva.delete(product.id) : nueva.add(product.id)));
      return nueva;
    });
  }

  function aplicar() {
    if (!accion) return;
    const numero = accionElegida?.pide ? Number(valor) : undefined;
    setMensaje(null);
    startTransition(async () => {
      const resultado = await bulkUpdateProducts([...seleccion], accion, numero);
      if ("error" in resultado && resultado.error) {
        setMensaje({ tipo: "error", texto: resultado.error });
        return;
      }
      setMensaje({ tipo: "ok", texto: `Listo: ${resultado.count} producto${resultado.count === 1 ? "" : "s"} actualizado${resultado.count === 1 ? "" : "s"}.` });
      setSeleccion(new Set());
      setAccion("");
      setValor("");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={busqueda}
          onChange={(evento) => filtrar(() => setBusqueda(evento.target.value))}
          placeholder="Buscar por nombre…"
          className={`${control} min-w-[14rem] flex-1`}
        />
        <select value={linea} onChange={(evento) => filtrar(() => setLinea(evento.target.value))} className={control}>
          <option value="">Todas las líneas</option>
          {productLines.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.label}
            </option>
          ))}
        </select>
        <select value={estado} onChange={(evento) => filtrar(() => setEstado(evento.target.value))} className={control}>
          <option value="">Todos los estados</option>
          <option value="activos">Visibles</option>
          <option value="ocultos">Ocultos</option>
          <option value="consultar">A consultar</option>
          <option value="sin-fotos">Sin fotos</option>
        </select>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#441a66]/10 bg-white px-4 py-3">
        <p className="text-sm font-semibold text-[#6b6472]">
          {seleccion.size ? (
            <span className="text-[#6f2fa3]">
              {seleccion.size} seleccionado{seleccion.size === 1 ? "" : "s"}
            </span>
          ) : (
            <>
              Mostrando {filtrados.length ? (paginaActual - 1) * POR_PAGINA + 1 : 0}–
              {Math.min(paginaActual * POR_PAGINA, filtrados.length)} de {filtrados.length}
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={accion}
            onChange={(evento) => {
              setAccion(evento.target.value as BulkAction | "");
              setValor("");
            }}
            disabled={!seleccion.size || aplicando}
            className={`${control} py-2 disabled:opacity-50`}
          >
            <option value="">Acciones masivas</option>
            {acciones.map((item) => (
              <option key={item.valor} value={item.valor}>
                {item.texto}
              </option>
            ))}
          </select>
          {accionElegida?.pide ? (
            <input
              type="number"
              min={accionElegida.pide === "precio" ? 1 : 0}
              step={accionElegida.pide === "precio" ? "0.01" : "1"}
              value={valor}
              onChange={(evento) => setValor(evento.target.value)}
              placeholder={accionElegida.pide === "precio" ? "Precio" : "Unidades"}
              className={`${control} w-32 py-2`}
            />
          ) : null}
          <button
            type="button"
            onClick={aplicar}
            disabled={!seleccion.size || !accion || (Boolean(accionElegida?.pide) && !valor) || aplicando}
            className="rounded-xl bg-[#10091b] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#2a1d3a] disabled:cursor-not-allowed disabled:bg-[#e6e1ea] disabled:text-[#9d96a3]"
          >
            {aplicando ? "Aplicando…" : "Aplicar"}
          </button>
        </div>
      </div>

      {mensaje ? (
        <p
          className={`mt-3 rounded-xl px-4 py-2.5 text-sm font-semibold ${
            mensaje.tipo === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {mensaje.texto}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-[#441a66]/8 bg-white shadow-[0_10px_30px_rgba(16,9,27,0.05)]">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead className="border-b border-[#441a66]/10 bg-[#faf8fc] text-xs font-bold uppercase tracking-[0.08em] text-[#6b6472]">
            <tr>
              <th className="w-12 px-4 py-3">
                <input type="checkbox" checked={todosMarcados} onChange={alternarPagina} aria-label="Seleccionar página" className="accent-[#6f2fa3]" />
              </th>
              <th className="w-16 px-2 py-3">Foto</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Líneas</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#441a66]/8">
            {visibles.map((product) => {
              const foto = product.images?.[0];
              const marcado = seleccion.has(product.id);
              return (
                <tr key={product.id} className={marcado ? "bg-[#f7f2fb]" : "hover:bg-[#fcfbfd]"}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => alternar(product.id)}
                      aria-label={`Seleccionar ${product.name}`}
                      className="accent-[#6f2fa3]"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <div className="relative size-11 overflow-hidden rounded-lg bg-[#f1ebf6]">
                      {foto ? (
                        <Image src={foto} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <span className="flex size-full items-center justify-center text-[0.6rem] font-black text-[#b69bcb]">3D</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/productos/${product.id}`} className="font-bold text-[#10091b] hover:text-[#6f2fa3]">
                      {product.name}
                    </Link>
                    <p className="text-xs text-[#8b8490]">/{product.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        product.active ? "bg-emerald-50 text-emerald-700" : "bg-[#f1ebf6] text-[#6b6472]"
                      }`}
                    >
                      {product.active ? "Visible" : "Oculto"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {[product.line, ...(product.extra_lines ?? [])].map((slug, indice) => (
                        <span
                          key={slug}
                          className={`rounded-md px-2 py-0.5 text-xs ${
                            indice === 0 ? "bg-[#f1ebf6] font-bold text-[#6f2fa3]" : "bg-[#f5f3f7] text-[#6b6472]"
                          }`}
                        >
                          {getLine(slug)?.nav ?? slug}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold tabular-nums">
                    {product.price === null ? <span className="font-semibold text-[#8a62ab]">A consultar</span> : money(product.price)}
                  </td>
                  <td className="px-4 py-3 text-[#6b6472]">{product.stock === null ? "A pedido" : product.stock}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/productos/${product.id}`} className="font-bold text-[#6f2fa3] hover:underline">
                      Editar
                    </Link>
                    {product.active ? (
                      <Link href={`/producto/${product.slug}`} target="_blank" className="ml-4 font-semibold text-[#8b8490] hover:text-[#10091b]">
                        Ver
                      </Link>
                    ) : null}
                  </td>
                </tr>
              );
            })}
            {!visibles.length ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-[#8b8490]">
                  No hay productos con esos filtros.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => (
            <button
              key={numero}
              type="button"
              onClick={() => setPagina(numero)}
              className={`size-9 rounded-lg text-sm font-bold transition ${
                numero === paginaActual ? "bg-[#6f2fa3] text-white" : "bg-white text-[#6b6472] hover:bg-[#f1ebf6]"
              }`}
            >
              {numero}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
