export const printMaterials = ["PLA", "PETG", "TPU", "otro"] as const;
export type PrintMaterial = (typeof printMaterials)[number];

export const printJobStatuses = ["en_cola", "imprimiendo", "terminada", "fallida", "cancelada"] as const;
export type PrintJobStatus = (typeof printJobStatuses)[number];

export const statusLabel: Record<PrintJobStatus, string> = {
  en_cola: "En cola",
  imprimiendo: "Imprimiendo",
  terminada: "Terminada",
  fallida: "Falló",
  cancelada: "Cancelada",
};

/** Pasos permitidos desde cada estado. Lo terminado o cancelado puede volver a la cola. */
export const nextStatuses: Record<PrintJobStatus, PrintJobStatus[]> = {
  en_cola: ["imprimiendo", "cancelada"],
  imprimiendo: ["terminada", "fallida", "en_cola"],
  fallida: ["en_cola", "cancelada"],
  terminada: ["en_cola"],
  cancelada: ["en_cola"],
};

export function isPrintMaterial(value: string): value is PrintMaterial {
  return (printMaterials as readonly string[]).includes(value);
}

export function isPrintJobStatus(value: string): value is PrintJobStatus {
  return (printJobStatuses as readonly string[]).includes(value);
}
