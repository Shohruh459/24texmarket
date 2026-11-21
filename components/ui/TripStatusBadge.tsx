const MAP: Record<string, { label: string; cls: string }> = {
  SCHEDULED: { label: "E'lon qilingan", cls: "bg-amber-100 text-amber-800" },
  FULL: { label: "To'ldi", cls: "bg-purple-100 text-purple-800" },
  STARTED: { label: "Yo'lda", cls: "bg-brand-100 text-brand-800" },
  FINISHED: { label: "Yakunlangan", cls: "bg-slate-100 text-slate-600" },
  CANCELLED: { label: "Bekor qilingan", cls: "bg-red-100 text-red-700" },
};

export default function TripStatusBadge({ status }: { status: string }) {
  const s = MAP[status] || MAP.SCHEDULED;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
