export type ProductLine = "calma" | "lectura" | "escena" | "servicio";

export type LineMeta = {
  slug: ProductLine;
  /** Nombre corto para la navegación del header. */
  nav: string;
  /** Nombre completo para filtros y footer. */
  label: string;
  /** Etiqueta sobre la tarjeta de producto y en el panel. */
  badge: string;
  /** Título en la página de producto. */
  detail: string;
  /** Cómo se presenta la colección en la home. */
  home: { name: string; text: string; gradient: string };
  cardGradient: string;
};

export const productLines: LineMeta[] = [
  {
    slug: "calma",
    nav: "Calma",
    label: "Línea Calma",
    badge: "Línea Calma",
    detail: "Línea Calma",
    home: {
      name: "Línea Calma",
      text: "Flexis y objetos sensoriales para acompañar momentos de pausa.",
      gradient: "from-[#6f2fa3] to-[#321447]",
    },
    cardGradient: "from-[#5d237f] to-[#271031] text-white",
  },
  {
    slug: "lectura",
    nav: "Lectura",
    label: "Línea Lectura",
    badge: "Línea Lectura",
    detail: "Línea Lectura",
    home: {
      name: "Línea Lectura",
      text: "Accesorios funcionales para quienes siempre tienen un libro cerca.",
      gradient: "from-[#29252e] to-[#121014]",
    },
    cardGradient: "from-[#323036] to-[#161419] text-white",
  },
  {
    slug: "escena",
    nav: "Escena",
    label: "Línea Escena",
    badge: "Línea Escena",
    detail: "Línea Escena",
    home: {
      name: "Línea Escena",
      text: "Props, escenografía y utilería para obras, cosplays y producciones.",
      gradient: "from-[#8a3fa8] to-[#2a1038]",
    },
    cardGradient: "from-[#71318f] to-[#20102c] text-white",
  },
  {
    slug: "servicio",
    nav: "Personalizados",
    label: "Personalizados",
    badge: "Servicio",
    detail: "Servicio personalizado",
    home: {
      name: "A tu medida",
      text: "Transformamos tu archivo, referencia o idea en una pieza real.",
      gradient: "from-[#5b5b61] to-[#28272b]",
    },
    cardGradient: "from-[#5a565f] to-[#222025] text-white",
  },
];

const bySlug = new Map(productLines.map((line) => [line.slug, line]));

export function getLine(slug: string): LineMeta | undefined {
  return bySlug.get(slug as ProductLine);
}

export function isProductLine(value: string | undefined): value is ProductLine {
  return Boolean(value && bySlug.has(value as ProductLine));
}

export function lineHref(slug: ProductLine) {
  return `/tienda?linea=${slug}`;
}
