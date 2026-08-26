"use server";

import { revalidatePath } from "next/cache";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type RetractionState = { error?: string; message?: string };

export async function submitRetraction(_prev: RetractionState, formData: FormData): Promise<RetractionState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const orderReference = String(formData.get("order_reference") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!fullName || !email) {
    return { error: "Necesitamos al menos tu nombre y tu email para responderte." };
  }

  if (!hasSupabaseEnv()) {
    return { error: "No pudimos registrar la solicitud. Escribinos por los canales de contacto." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("retraction_requests").insert({
    full_name: fullName,
    email,
    phone: phone || null,
    order_reference: orderReference || null,
    reason: reason || null,
  });

  if (error) {
    return { error: "No pudimos registrar la solicitud. Probá de nuevo o escribinos por los canales de contacto." };
  }

  revalidatePath("/admin/solicitudes");
  return {
    message:
      "Recibimos tu solicitud. Te vamos a contactar para coordinar la devolución y el reintegro dentro de las próximas 48 horas hábiles.",
  };
}
