"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState, type DragEvent } from "react";
import { saveProduct, type ProductFormState } from "@/lib/admin/product-actions";
import { slugify } from "@/lib/admin/slug";
import { uploadProductImage } from "@/lib/admin/upload-image";
import { productLines } from "@/lib/store/lines";
import { IconUpload } from "./icons";

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  line: string;
  extra_lines: string[] | null;
  description: string | null;
  price: number | null;
  cost: number | null;
  stock: number | null;
  weight_grams: number | null;
  images: string[] | null;
  active: boolean;
};

type Foto = { key: string; url?: string; preview: string; subiendo: boolean; error?: string };

const IMAGENES_MAX = 6;

const campo =
  "w-full rounded-xl border border-[#441a66]/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8a62ab] focus:ring-2 focus:ring-[#8a62ab]/25";
const etiqueta = "mb-1.5 block text-sm font-bold text-[#10091b]";
const tarjeta = "rounded-2xl border border-[#441a66]/8 bg-white p-6 shadow-[0_10px_30px_rgba(16,9,27,0.05)]";

export function ProductForm({ product }: { product?: AdminProduct }) {
  const [state, formAction, guardando] = useActionState<ProductFormState, FormData>(saveProduct, {});

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  // Mientras no se toque a mano, la URL se arma sola a partir del nombre.
  const [slugManual, setSlugManual] = useState(Boolean(product));
  const [line, setLine] = useState(product?.line ?? productLines[0].slug);
  const [consultar, setConsultar] = useState(product ? product.price === null : false);
  const [fotos, setFotos] = useState<Foto[]>(
    (product?.images ?? []).map((url) => ({ key: url, url, preview: url, subiendo: false })),
  );
  const [arrastrando, setArrastrando] = useState(false);
  const inputFotos = useRef<HTMLInputElement>(null);

  const slugFinal = slugManual ? slug : slugify(name);
  const subiendo = fotos.some((foto) => foto.subiendo);
  const urls = fotos.filter((foto) => foto.url && !foto.error).map((foto) => foto.url as string);

  async function agregarFotos(lista: FileList | File[]) {
    const lugares = IMAGENES_MAX - fotos.filter((foto) => !foto.error).length;
    const nuevas = Array.from(lista).slice(0, Math.max(0, lugares));
    if (!nuevas.length) return;

    const pendientes: Foto[] = nuevas.map((archivo) => ({
      key: `${Date.now()}-${archivo.name}-${Math.random()}`,
      preview: URL.createObjectURL(archivo),
      subiendo: true,
    }));
    setFotos((actuales) => [...actuales, ...pendientes]);

    await Promise.all(
      nuevas.map(async (archivo, indice) => {
        const { key } = pendientes[indice];
        try {
          const url = await uploadProductImage(archivo, slugFinal);
          setFotos((actuales) => actuales.map((foto) => (foto.key === key ? { ...foto, url, subiendo: false } : foto)));
        } catch (error) {
          const mensaje = error instanceof Error ? error.message : "No se pudo subir la foto.";
          setFotos((actuales) =>
            actuales.map((foto) => (foto.key === key ? { ...foto, subiendo: false, error: mensaje } : foto)),
          );
        }
      }),
    );
  }

  function quitar(key: string) {
    setFotos((actuales) => actuales.filter((foto) => foto.key !== key));
  }

  // La principal es la primera: es la que se ve en la tarjeta y al compartir.
  function hacerPrincipal(key: string) {
    setFotos((actuales) => {
      const elegida = actuales.find((foto) => foto.key === key);
      return elegida ? [elegida, ...actuales.filter((foto) => foto.key !== key)] : actuales;
    });
  }

  function soltar(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault();
    setArrastrando(false);
    if (evento.dataTransfer.files.length) agregarFotos(evento.dataTransfer.files);
  }

  return (
    <form action={formAction}>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="images" value={JSON.stringify(urls)} />

      {state.error ? (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <section className={tarjeta}>
            <h2 className="text-lg font-black">Datos del producto</h2>

            <div className="mt-5 space-y-5">
              <div>
                <label htmlFor="name" className={etiqueta}>
                  Nombre
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  value={name}
                  onChange={(evento) => setName(evento.target.value)}
                  placeholder="Ej: Cubo infinito — Chico"
                  className={campo}
                />
              </div>

              <div>
                <label htmlFor="slug" className={etiqueta}>
                  URL en la tienda
                </label>
                <div className="flex items-center overflow-hidden rounded-xl border border-[#441a66]/15 bg-[#faf8fc] focus-within:border-[#8a62ab] focus-within:ring-2 focus-within:ring-[#8a62ab]/25">
                  <span className="pl-4 text-sm text-[#8b8490]">manish3d.com/producto/</span>
                  <input
                    id="slug"
                    name="slug"
                    value={slugFinal}
                    onChange={(evento) => {
                      setSlugManual(true);
                      setSlug(slugify(evento.target.value));
                    }}
                    className="w-full bg-transparent px-1 py-3 text-sm font-semibold outline-none"
                  />
                </div>
                <p className="mt-1.5 text-xs text-[#8b8490]">
                  Se completa sola con el nombre. Si la cambiás en un producto publicado, los links viejos dejan de funcionar.
                </p>
              </div>

              <div>
                <label htmlFor="description" className={etiqueta}>
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={product?.description ?? ""}
                  placeholder="Qué es, para qué sirve, qué la hace especial."
                  className={`${campo} resize-y`}
                />
              </div>
            </div>
          </section>

          <section className={tarjeta}>
            <h2 className="text-lg font-black">Precio y stock</h2>

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-[#f5f3f7] p-1">
              {[
                { valor: false, texto: "Con precio" },
                { valor: true, texto: "Precio a consultar" },
              ].map((opcion) => (
                <label
                  key={opcion.texto}
                  className={`cursor-pointer rounded-lg px-4 py-2.5 text-center text-sm font-bold transition ${
                    consultar === opcion.valor ? "bg-white text-[#6f2fa3] shadow-sm" : "text-[#6b6472]"
                  }`}
                >
                  <input
                    type="radio"
                    name="price_mode"
                    value={opcion.valor ? "consultar" : "precio"}
                    checked={consultar === opcion.valor}
                    onChange={() => setConsultar(opcion.valor)}
                    className="sr-only"
                  />
                  {opcion.texto}
                </label>
              ))}
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {consultar ? (
                <p className="rounded-xl bg-[#f1ebf6] px-4 py-3 text-sm text-[#6f2fa3] sm:col-span-2">
                  En la tienda se muestra “A consultar” con un botón a WhatsApp, y no se puede agregar al carrito.
                </p>
              ) : (
                <div>
                  <label htmlFor="price" className={etiqueta}>
                    Precio de venta ($)
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    defaultValue={product?.price ?? ""}
                    className={campo}
                  />
                </div>
              )}
              <div>
                <label htmlFor="cost" className={etiqueta}>
                  Costo ($)
                </label>
                <input id="cost" name="cost" type="number" min="0" step="0.01" defaultValue={product?.cost ?? ""} className={campo} />
              </div>
              <div>
                <label htmlFor="stock" className={etiqueta}>
                  Stock
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Vacío = a pedido"
                  defaultValue={product?.stock ?? ""}
                  className={campo}
                />
              </div>
              <div>
                <label htmlFor="weight_grams" className={etiqueta}>
                  Peso (gramos)
                </label>
                <input
                  id="weight_grams"
                  name="weight_grams"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Para cotizar envíos"
                  defaultValue={product?.weight_grams ?? ""}
                  className={campo}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className={tarjeta}>
            <h2 className="text-lg font-black">Publicación</h2>
            <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-[#faf8fc] px-4 py-3">
              <span>
                <span className="block text-sm font-bold">Visible en la tienda</span>
                <span className="text-xs text-[#6b6472]">Si lo desmarcás, queda guardado pero oculto.</span>
              </span>
              <input name="active" type="checkbox" defaultChecked={product?.active ?? true} className="size-5 accent-[#6f2fa3]" />
            </label>

            <label htmlFor="line" className={`${etiqueta} mt-5`}>
              Línea principal
            </label>
            <select id="line" name="line" value={line} onChange={(evento) => setLine(evento.target.value)} className={campo}>
              {productLines.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>

            <p className={`${etiqueta} mt-5`}>También aparece en</p>
            <div className="flex flex-wrap gap-2">
              {productLines
                .filter((item) => item.slug !== line)
                .map((item) => (
                  <label
                    key={item.slug}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#441a66]/15 px-3 py-2 text-sm has-[:checked]:border-[#6f2fa3] has-[:checked]:bg-[#f1ebf6] has-[:checked]:font-bold has-[:checked]:text-[#6f2fa3]"
                  >
                    <input
                      type="checkbox"
                      name="extra_lines"
                      value={item.slug}
                      defaultChecked={product?.extra_lines?.includes(item.slug)}
                      className="accent-[#6f2fa3]"
                    />
                    {item.nav}
                  </label>
                ))}
            </div>
          </section>

          <section className={tarjeta}>
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-black">Fotos</h2>
              <span className="text-xs font-semibold text-[#8b8490]">
                {urls.length}/{IMAGENES_MAX}
              </span>
            </div>

            <div
              onDragOver={(evento) => {
                evento.preventDefault();
                setArrastrando(true);
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={soltar}
              onClick={() => inputFotos.current?.click()}
              className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
                arrastrando ? "border-[#6f2fa3] bg-[#f1ebf6]" : "border-[#441a66]/20 hover:border-[#8a62ab] hover:bg-[#faf8fc]"
              }`}
            >
              <IconUpload className="size-8 text-[#8a62ab]" />
              <p className="mt-2 text-sm font-bold text-[#6f2fa3]">
                {arrastrando ? "Soltá las fotos acá" : "Arrastrá fotos o hacé clic para elegir"}
              </p>
              <p className="mt-1 text-xs text-[#8b8490]">Se optimizan solas antes de subir. Hasta {IMAGENES_MAX}.</p>
              <input
                ref={inputFotos}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(evento) => {
                  if (evento.target.files) agregarFotos(evento.target.files);
                  evento.target.value = "";
                }}
              />
            </div>

            {fotos.length ? (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {fotos.map((foto, indice) => (
                  <div
                    key={foto.key}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 ${
                      foto.error ? "border-red-300" : indice === 0 ? "border-[#6f2fa3]" : "border-transparent"
                    }`}
                  >
                    <Image src={foto.preview} alt="" fill className="object-cover" unoptimized />

                    {foto.subiendo ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-bold text-[#6f2fa3]">
                        Subiendo…
                      </div>
                    ) : null}
                    {foto.error ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-50/95 p-2 text-center text-[0.65rem] font-semibold text-red-700">
                        {foto.error}
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => quitar(foto.key)}
                      aria-label="Quitar foto"
                      className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-white text-sm font-bold text-red-600 shadow"
                    >
                      ×
                    </button>
                    {!foto.error && !foto.subiendo ? (
                      <button
                        type="button"
                        onClick={() => hacerPrincipal(foto.key)}
                        className={`absolute inset-x-1.5 bottom-1.5 rounded-md py-1 text-[0.65rem] font-bold ${
                          indice === 0 ? "bg-[#6f2fa3] text-white" : "bg-white/90 text-[#10091b] hover:bg-white"
                        }`}
                      >
                        {indice === 0 ? "★ Principal" : "☆ Hacer principal"}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 mt-8 flex items-center justify-end gap-3 border-t border-[#441a66]/10 bg-[#f5f3f7]/95 py-4 backdrop-blur">
        {subiendo ? <span className="mr-auto text-sm font-semibold text-[#6f2fa3]">Esperando que terminen de subir las fotos…</span> : null}
        <Link
          href="/admin/productos"
          className="rounded-xl border border-[#441a66]/15 bg-white px-5 py-3 text-sm font-bold text-[#6b6472] transition hover:text-[#10091b]"
        >
          Cancelar
        </Link>
        <button
          disabled={guardando || subiendo}
          className="rounded-xl bg-[#6f2fa3] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(111,47,163,0.3)] transition hover:bg-[#8544b5] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {guardando ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
