import type { MetadataRoute } from "next";
import { hasSupabaseEnv } from "@/lib/env";
import { demoProducts } from "@/lib/store/demo-products";
import { lineHref, productLines } from "@/lib/store/lines";
import { createClient } from "@/lib/supabase/server";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.manish3d.com").replace(/\/$/, "");

// Se arma en cada visita del buscador: si no, un producto nuevo no aparecería
// hasta el próximo deploy.
export const dynamic = "force-dynamic";

type ProductEntry = { slug: string; created_at?: string };

async function getProducts(): Promise<ProductEntry[]> {
  if (!hasSupabaseEnv()) return demoProducts.map((product) => ({ slug: product.slug }));

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select("slug, created_at").eq("active", true);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const ahora = new Date();

  const principales: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: ahora, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/tienda`, lastModified: ahora, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/calculadora`, lastModified: ahora, changeFrequency: "monthly", priority: 0.8 },
  ];

  const lineas: MetadataRoute.Sitemap = productLines.map((line) => ({
    url: `${siteUrl}${lineHref(line.slug)}`,
    lastModified: ahora,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const fichas: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/producto/${product.slug}`,
    lastModified: product.created_at ? new Date(product.created_at) : ahora,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Se indexan porque son información pública que la gente busca antes de
  // comprar, aunque no compitan por posiciones.
  const legales: MetadataRoute.Sitemap = [
    "/terminos",
    "/devoluciones",
    "/privacidad",
    "/cookies",
    "/arrepentimiento",
  ].map((ruta) => ({
    url: `${siteUrl}${ruta}`,
    lastModified: ahora,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  return [...principales, ...lineas, ...fichas, ...legales];
}
