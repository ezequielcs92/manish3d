"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const name = getString(formData, "name");
  const slug = getString(formData, "slug");
  const line = getString(formData, "line");

  if (!name || !slug || !line) return;

  await supabase.from("products").insert({
    name,
    slug,
    line,
    description: getString(formData, "description") || null,
    price: getNumber(formData, "price"),
    cost: getNumber(formData, "cost"),
    stock: getNullableNumber(formData, "stock"),
    weight_grams: getNullableNumber(formData, "weight_grams"),
    images: getImageUrls(formData),
    active: formData.get("active") === "on",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/productos");
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
