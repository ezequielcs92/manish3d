"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "productos";
const LADO_MAX = 1600;
const CALIDAD = 0.85;
const PESO_MAX_ORIGINAL = 25 * 1024 * 1024;

/**
 * Reduce la foto a 1600 px de lado y la pasa a WebP. Una foto de celular de
 * 4 MB queda en unos cientos de KB: la tienda carga más rápido y el bucket no
 * se llena de originales gigantes.
 */
async function comprimir(archivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const contexto = canvas.getContext("2d");
  if (!contexto) throw new Error("El navegador no pudo procesar la imagen.");
  contexto.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", CALIDAD));
  if (!blob) throw new Error("No se pudo convertir la imagen.");
  return blob;
}

/**
 * Sube directo del navegador al bucket, con la sesión del usuario: la política
 * de storage solo deja subir al equipo. Va por acá y no por una server action
 * porque esas no aceptan más de 1 MB por pedido.
 */
export async function uploadProductImage(archivo: File, carpeta: string): Promise<string> {
  if (!archivo.type.startsWith("image/")) throw new Error(`“${archivo.name}” no es una imagen.`);
  if (archivo.size > PESO_MAX_ORIGINAL) throw new Error(`“${archivo.name}” pesa más de 25 MB.`);

  let blob: Blob;
  try {
    blob = await comprimir(archivo);
  } catch {
    throw new Error(`No se pudo leer “${archivo.name}”. Probá con JPG, PNG o WebP.`);
  }

  const sufijo = Math.random().toString(36).slice(2, 8);
  const ruta = `${carpeta || "sin-nombre"}/${Date.now()}-${sufijo}.webp`;

  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(ruta, blob, { contentType: "image/webp", upsert: false });
  if (error) throw new Error(`No se pudo subir “${archivo.name}”: ${error.message}`);

  return supabase.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
}
