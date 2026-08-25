const toneByStatus: Record<string, string> = {
  pendiente: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  produccion: "border-orange-400/30 bg-orange-400/10 text-orange-200",
  listo: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  enviado: "border-[#8a62ab]/40 bg-[#6f2fa3]/20 text-[#c4a6dd]",
  entregado: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  cancelado: "border-red-400/30 bg-red-400/10 text-red-200",
  pagado: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  fallido: "border-red-400/30 bg-red-400/10 text-red-200",
  reembolsado: "border-white/20 bg-white/10 text-[#d6d3da]",
};

/** Versión sobre fondo oscuro del pill que usa el panel interno. */
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${
        toneByStatus[status] ?? "border-white/15 bg-white/5 text-[#b8b5bd]"
      }`}
    >
      {status}
    </span>
  );
}
