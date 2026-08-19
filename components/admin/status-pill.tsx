const toneByStatus: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-900 ring-amber-200",
  produccion: "bg-orange-100 text-orange-900 ring-orange-200",
  listo: "bg-sky-100 text-sky-900 ring-sky-200",
  enviado: "bg-violet-100 text-violet-900 ring-violet-200",
  entregado: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  cancelado: "bg-red-100 text-red-900 ring-red-200",
  pagado: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  fallido: "bg-red-100 text-red-900 ring-red-200",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        toneByStatus[status] ?? "bg-stone-100 text-stone-800 ring-stone-200"
      }`}
    >
      {status}
    </span>
  );
}
