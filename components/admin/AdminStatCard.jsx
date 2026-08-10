export function AdminStatCard({ label, value, hint, tone = "default" }) {
  const tones = {
    default: "border-white/10 bg-white/[0.03]",
    good: "border-emerald-500/30 bg-emerald-500/10",
    warn: "border-amber-500/30 bg-amber-500/10",
  };

  return (
    <div className={`rounded-xl border p-5 ${tones[tone] ?? tones.default}`}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/45">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold tabular-nums text-white">{value ?? "—"}</p>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-white/50">{hint}</p> : null}
    </div>
  );
}

export default AdminStatCard;
