"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isProductLine } from "@/lib/store/lines";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : 0;
}

function getNullableNumber(formData: FormData, key: string) {
  const raw = getString(formData, key);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function getImageUrls(formData: FormData) {
  return getString(formData, "image_urls")
    .split(/[\n,]/)
    .map((url) => url.trim())
    .filter((url) => {
      try {
        const protocol = new URL(url).protocol;
        return protocol === "https:" || protocol === "http:";
      } catch {
        return false;
      }
    })
    .slice(0, 6);
}

const IMAGENES_MAX = 6;
const PESO_MAX_BYTES = 5 * 1024 * 1024;
const TIPOS_ACEPTADOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Sube al bucket las fotos elegidas y devuelve sus URLs públicas. */
async function subirFotos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  formData: FormData,
  slug: string,
) {
  const archivos = formData
    .getAll("image_files")
    .filter((item): item is File => item instanceof File && item.size > 0);

  const urls: string[] = [];

  for (const archivo of archivos.slice(0, IMAGENES_MAX)) {
    if (!TIPOS_ACEPTADOS.includes(archivo.type) || archivo.size > PESO_MAX_BYTES) continue;

    const extension = archivo.name.split(".").pop()?.toLowerCase() || "jpg";
    // El slug ordena y el sufijo evita pisar una foto anterior del mismo producto.
    const ruta = `${slug}/${Date.now()}-${urls.length}.${extension}`;

    const { error } = await supabase.storage
      .from("productos")
      .upload(ruta, archivo, { contentType: archivo.type, upsert: false });

    if (error) continue;

    const { data } = supabase.storage.from("productos").getPublicUrl(ruta);
    urls.push(data.publicUrl);
  }

  return urls;
}

/**
 * Precio según lo que se eligió en el panel: "consultar" lo deja nulo aunque el
 * campo tenga un número. Con precio elegido pero vacío también queda a
 * consultar, que es lo seguro: nunca se publica en $0.
 */
function getPrice(formData: FormData) {
  if (getString(formData, "price_mode") === "consultar") return null;
  return getNullableNumber(formData, "price");
}

/** Líneas adicionales marcadas, sin repetir y sin la principal. */
function getExtraLines(formData: FormData, principal: string) {
  const marcadas = formData.getAll("extra_lines").map(String).filter(isProductLine);
  return [...new Set(marcadas)].filter((line) => line !== principal);
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const name = getString(formData, "name");
  const slug = getString(formData, "slug");
  const line = getString(formData, "line");

  if (!name || !slug || !isProductLine(line)) return;

  const subidas = await subirFotos(supabase, formData, slug);
  const images = [...subidas, ...getImageUrls(formData)].slice(0, IMAGENES_MAX);

  await supabase.from("products").insert({
    name,
    slug,
    line,
    description: getString(formData, "description") || null,
    price: getPrice(formData),
    cost: getNumber(formData, "cost"),
    stock: getNullableNumber(formData, "stock"),
    weight_grams: getNullableNumber(formData, "weight_grams"),
    images,
    extra_lines: getExtraLines(formData, line),
    active: formData.get("active") === "on",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/tienda");
}

/**
 * Edición rápida de lo que cambia seguido: precio, stock, peso y visibilidad.
 * También suma fotos a un producto ya creado, que antes solo se podían cargar
 * en el alta. Precio vacío deja el producto "a consultar".
 */
export async function updateProduct(formData: FormData) {
  const supabase = await createClient();
  const id = getString(formData, "id");

  if (!id) return;

  const { data: actual } = await supabase.from("products").select("slug, line, images").eq("id", id).single();
  if (!actual) return;

  const subidas = await subirFotos(supabase, formData, actual.slug);
  const images = [...(actual.images ?? []), ...subidas].slice(0, IMAGENES_MAX);

  await supabase
    .from("products")
    .update({
      price: getPrice(formData),
      cost: getNumber(formData, "cost"),
      stock: getNullableNumber(formData, "stock"),
      weight_grams: getNullableNumber(formData, "weight_grams"),
      images,
      extra_lines: getExtraLines(formData, actual.line),
      active: formData.get("active") === "on",
    })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/tienda");
}

export async function createManualOrder(formData: FormData) {
  const supabase = await createClient();
  const clientName = getString(formData, "client_name");

  if (!clientName) return;

  await supabase.from("orders").insert({
    client_name: clientName,
    client_phone: getString(formData, "client_phone") || null,
    client_email: getString(formData, "client_email") || null,
    channel: getString(formData, "channel") || "whatsapp",
    status: getString(formData, "status") || "pendiente",
    total: getNumber(formData, "total"),
    payment_status: getString(formData, "payment_status") || "pendiente",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
}

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient();
  const id = getString(formData, "id");
  const status = getString(formData, "status");

  if (!id || !status) return;

  await supabase.from("orders").update({ status }).eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/produccion");
}

export async function createMaterial(formData: FormData) {
  const supabase = await createClient();
  const name = getString(formData, "name");

  if (!name) return;

  await supabase.from("materials").insert({
    name,
    type: getString(formData, "type") || "PLA",
    color: getString(formData, "color") || null,
    stock_grams: getNumber(formData, "stock_grams"),
    cost_per_kg: getNumber(formData, "cost_per_kg"),
    low_stock_threshold: getNumber(formData, "low_stock_threshold"),
  });

  revalidatePath("/admin/produccion");
}

export async function createTransaction(formData: FormData) {
  const supabase = await createClient();
  const type = getString(formData, "type");
  const amount = getNumber(formData, "amount");

  if (!type || amount <= 0) return;

  await supabase.from("transactions").insert({
    type,
    amount,
    description: getString(formData, "description") || null,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/finanzas");
}

export async function resolveRetraction(formData: FormData) {
  const supabase = await createClient();
  const id = getString(formData, "id");

  if (!id) return;

  await supabase.from("retraction_requests").update({ status: "resuelta" }).eq("id", id);

  revalidatePath("/admin/solicitudes");
}
