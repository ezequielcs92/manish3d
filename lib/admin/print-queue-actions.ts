"use server";

import { revalidatePath } from "next/cache";
import { isPrintJobStatus, isPrintMaterial, nextStatuses } from "@/lib/admin/print-queue";
import { createClient } from "@/lib/supabase/server";

export type PrintJobFormState = { error?: string; ok?: number; values?: Record<string, string> };

function texto(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numeroOpcional(formData: FormData, key: string) {
  const raw = texto(formData, key).replace(",", ".");
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : Number.NaN;
}

function revalidarCola() {
  revalidatePath("/admin/produccion");
  revalidatePath("/admin");
}

/** Suma un trabajo a la cola. Nombre, material, color y cantidad son obligatorios. */
export async function addPrintJob(_prev: PrintJobFormState, formData: FormData): Promise<PrintJobFormState> {
  const name = texto(formData, "name");
  const material = texto(formData, "material");
  const color = texto(formData, "color");
  const quantity = Number(texto(formData, "quantity"));
  const hours = numeroOpcional(formData, "estimated_hours");
  const grams = numeroOpcional(formData, "estimated_grams");
  const orderId = texto(formData, "order_id");

  // React limpia el formulario después de cada envío: si hay error, se
  // devuelve lo cargado para que no haya que escribirlo de nuevo.
  const values = Object.fromEntries([...formData.entries()].map(([key, value]) => [key, String(value)]));
  const fallo = (error: string) => ({ error, values });

  if (!name) return fallo("Poné qué hay que imprimir.");
  if (!isPrintMaterial(material)) return fallo("Elegí el material.");
  if (!color) return fallo("Poné el color.");
  if (!Number.isInteger(quantity) || quantity <= 0) return fallo("La cantidad tiene que ser un número entero mayor a cero.");
  if (Number.isNaN(hours) || Number.isNaN(grams)) return fallo("Horas y gramos tienen que ser números mayores a cero.");

  const supabase = await createClient();
  const { error } = await supabase.from("print_jobs").insert({
    name,
    material,
    color,
    quantity,
    urgent: formData.get("urgent") === "on",
    estimated_hours: hours,
    estimated_grams: grams,
    notes: texto(formData, "notes") || null,
    order_id: orderId || null,
  });

  if (error) return fallo("No se pudo sumar a la cola. Probá de nuevo.");

  revalidarCola();
  // Cambia en cada alta para que el formulario sepa que tiene que limpiarse.
  return { ok: Date.now() };
}

/** Mueve un trabajo de estado, solo por los pasos permitidos. */
export async function updatePrintJobStatus(formData: FormData) {
  const id = texto(formData, "id");
  const status = texto(formData, "status");
  if (!id || !isPrintJobStatus(status)) return;

  const supabase = await createClient();
  const { data: actual } = await supabase.from("print_jobs").select("status").eq("id", id).single();
  if (!actual || !isPrintJobStatus(actual.status) || !nextStatuses[actual.status].includes(status)) return;

  const ahora = new Date().toISOString();
  const cambios: Record<string, unknown> = { status };
  if (status === "imprimiendo") cambios.started_at = ahora;
  if (status === "terminada" || status === "fallida" || status === "cancelada") cambios.finished_at = ahora;
  if (status === "en_cola") Object.assign(cambios, { started_at: null, finished_at: null });

  await supabase.from("print_jobs").update(cambios).eq("id", id);
  revalidarCola();
}

/** Marca o desmarca un trabajo como urgente: los urgentes van primero en la cola. */
export async function togglePrintJobUrgent(formData: FormData) {
  const id = texto(formData, "id");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("print_jobs").update({ urgent: formData.get("urgent") === "true" }).eq("id", id);
  revalidarCola();
}
