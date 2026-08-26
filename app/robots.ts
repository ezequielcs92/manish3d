import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.manish3d.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nada de esto tiene sentido en un buscador: el panel y la cuenta son
      // privados, y carrito, checkout y seguimiento dependen de una sesión o de
      // un pedido concreto.
      disallow: ["/admin", "/cuenta", "/api", "/carrito", "/checkout", "/pedido", "/login", "/registro"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
