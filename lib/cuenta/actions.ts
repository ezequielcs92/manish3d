"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; message?: string };

export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tenés que iniciar sesión de nuevo." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const street = String(formData.get("street") ?? "").trim();
  const zone = String(formData.get("zone") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!fullName) return { error: "El nombre no puede quedar vacío." };

  const hasAddress = Boolean(street || zone || notes);

  const { error } = await supabase
    .from("users")
    .update({
      full_name: fullName,
      phone: phone || null,
      shipping_address: hasAddress ? { street, zone, notes } : null,
    })
    .eq("id", user.id);

  if (error) return { error: "No se pudieron guardar los cambios. Probá de nuevo." };

  revalidatePath("/cuenta");
  return { message: "Datos actualizados." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
