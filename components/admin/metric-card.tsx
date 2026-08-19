export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-[#441a66]/10 bg-white p-5 shadow-[0_18px_60px_rgba(16,9,27,0.07)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(68,26,102,0.14)]">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8a62ab]">{label}</p>
      <p className="mt-4 text-3xl font-black tabular-nums text-[#441a66]">{value}</p>
      <p className="mt-2 text-sm text-[#545454]">{detail}</p>
    </article>
  );
}
