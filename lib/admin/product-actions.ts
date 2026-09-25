"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/admin/slug";
import { isProductLine } from "@/lib/store/lines";
import { createClient } from "@/lib/supabase/server";

export type ProductFormState = { error?: string };

const IMAGENES_MAX = 6;
const BUCKET = "productos";

function texto(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numeroOpcional(formData: FormData, key: string) {
  const raw = texto(formData, key);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : Number.NaN;
}

/** Ruta dentro del bucket si la URL es una foto propia; null si es externa. */
function rutaEnBucket(url: string) {
  const marca = `/storage/v1/object/public/${BUCKET}/`;
  const indice = url.indexOf(marca);
  return indice === -1 ? null : decodeURIComponent(url.slice(indice + marca.length));
}

function revalidarCatalogo() {
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/tienda");
  revalidatePath("/");
}

/**
 * Alta y edición desde la página del producto. Las fotos ya llegan subidas: el
 * navegador las comprime y las sube directo al bucket, porque una server action
 * no acepta más de 1 MB y cualquier foto de celular lo supera.
 */
export async function saveProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const supabase = await createClient();
  const id = texto(formData, "id");
  const name = texto(formData, "name");
  const slug = slugify(texto(formData, "slug") || name);
  const line = texto(formData, "line");
  const consultar = texto(formData, "price_mode") === "consultar";
  const price = consultar ? null : numeroOpcional(formData, "price");
  const cost = numeroOpcional(formData, "cost");
  const stock = numeroOpcional(formData, "stock");
  const weight = numeroOpcional(formData, "weight_grams");

  if (!name) return { error: "El producto necesita un nombre." };
  if (!slug) return { error: "La URL del producto quedó vacía: revisá el nombre." };
  if (!isProductLine(line)) return { error: "Elegí la línea principal del producto." };
  if (!consultar && (price === null || Number.isNaN(price) || price <= 0)) {
    return { error: "Cargá un precio mayor a cero, o marcá el producto como “a consultar”." };
  }
  if ([cost, stock, weight].some((value) => Number.isNaN(value))) {
    return { error: "Costo, stock y peso tienen que ser números positivos." };
  }
  if (stock !== null && !Number.isInteger(stock)) return { error: "El stock tiene que ser un número entero." };

  let images: string[] = [];
  try {
    const parsed = JSON.parse(texto(formData, "images") || "[]");
    images = Array.isArray(parsed) ? parsed.filter((url): url is string => typeof url === "string").slice(0, IMAGENES_MAX) : [];
  } catch {
    return { error: "No se pudo leer la galería de fotos. Recargá la página y probá de nuevo." };
  }

  const extraLines = [...new Set(formData.getAll("extra_lines").map(String).filter(isProductLine))].filter(
    (value) => value !== line,
  );

  const datos = {
    name,
    slug,
    line,
    extra_lines: extraLines,
    description: texto(formData, "description") || null,
    price,
    cost: cost ?? 0,
    stock: stock === null ? null : Math.trunc(stock),
    weight_grams: weight === null ? null : Math.round(weight),
    images,
    active: formData.get("active") === "on",
  };

  let fotosAnteriores: string[] = [];

  if (id) {
    const { data: actual } = await supabase.from("products").select("images").eq("id", id).single();
    fotosAnteriores = actual?.images ?? [];
  }

  const { error } = id
    ? await supabase.from("products").update(datos).eq("id", id)
    : await supabase.from("products").insert(datos);

  if (error) {
    if (error.code === "23505") return { error: `Ya existe un producto con la URL “${slug}”. Cambiá el nombre o la URL.` };
    return { error: "No se pudo guardar el producto. Probá de nuevo." };
  }

  // Las fotos que se sacaron de la galería se borran del bucket para no
  // acumular archivos huérfanos. Las URLs externas no se tocan.
  const quitadas = fotosAnteriores
    .filter((url) => !images.includes(url))
    .map(rutaEnBucket)
    .filter((ruta): ruta is string => Boolean(ruta));
  if (quitadas.length) await supabase.storage.from(BUCKET).remove(quitadas);

  revalidarCatalogo();
  revalidatePath(`/producto/${slug}`);
  redirect(`/admin/productos?guardado=${encodeURIComponent(name)}`);
}

export type BulkAction = "activar" | "ocultar" | "consultar" | "precio" | "stock";

/** Acciones masivas del listado, sobre los productos seleccionados. */
export async function bulkUpdateProducts(ids: string[], action: BulkAction, value?: number) {
  if (!ids.length) return { error: "No hay productos seleccionados." };

  let cambios: Record<string, unknown>;
  switch (action) {
    case "activar":
      cambios = { active: true };
      break;
    case "ocultar":
      cambios = { active: false };
      break;
    case "consultar":
      cambios = { price: null };
      break;
    case "precio":
      if (value === undefined || !Number.isFinite(value) || value <= 0) return { error: "El precio tiene que ser mayor a cero." };
      cambios = { price: value };
      break;
    case "stock":
      if (value === undefined || !Number.isInteger(value) || value < 0) return { error: "El stock tiene que ser un entero positivo." };
      cambios = { stock: value };
      break;
    default:
      return { error: "Acción desconocida." };
  }

  const supabase = await createClient();
  const { error, count } = await supabase.from("products").update(cambios, { count: "exact" }).in("id", ids);

  if (error) return { error: "No se pudieron actualizar los productos." };

  revalidarCatalogo();
  return { count: count ?? ids.length };
}
