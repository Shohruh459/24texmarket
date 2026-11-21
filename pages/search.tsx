import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../lib/api";
import { cities } from "../data/cities";
import { fmtDateTime } from "../lib/date";
import PageHead from "../components/ui/PageHead";
import EmptyState from "../components/ui/EmptyState";

interface TripResult {
  id: string;
  fromCity: string;
  toCity: string;
  departAt: string;
  pricePerSeat: number;
  totalSeats: number;
  freeSeats: number;
  carModel: string;
  carPlate: string;
  driverName: string;
}

export default function SearchPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [trips, setTrips] = useState<TripResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  const runSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (date) params.set("date", date);
      if (maxPrice) params.set("maxPrice", maxPrice);
      const data = await apiFetch<TripResult[]>(`/api/trips?${params.toString()}`);
      setTrips(data);
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch();
  };

  return (
    <>
      <PageHead title="Qatnov qidirish" description="Viloyatlararo qatnovlarni yo'nalish, sana va narx bo'yicha qidiring." />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <h1 className="text-2xl font-bold text-ink">Qatnov qidirish</h1>

        {/* Filtr paneli */}
        <form onSubmit={onSubmit} className="card-pad space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Qayerdan</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="select">
                <option value="">Barcha shaharlar</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Qayerga</label>
              <select value={to} onChange={(e) => setTo(e.target.value)} className="select">
                <option value="">Barcha shaharlar</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Sana</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Maksimal narx (so'm)</label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Masalan: 100000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary btn-block">
            🔍 Qidirish
          </button>
        </form>

        {/* Natijalar */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card-pad">
                <div className="skeleton h-5 w-1/2 mb-2" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="🔍"
              title="Qatnov topilmadi"
              description="Boshqa yo'nalish, sana yoki narx bilan qayta urinib ko'ring."
            />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-ink-muted">{trips.length} ta qatnov topildi</p>
            {trips.map((t) => (
              <Link
                key={t.id}
                href={`/trip/${t.id}`}
                className="card-pad block hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
              >
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink flex items-center gap-2 flex-wrap">
                      <span>{t.fromCity}</span>
                      <span className="text-brand-400">→</span>
                      <span>{t.toCity}</span>
                    </p>
                    <p className="text-sm text-ink-muted mt-1">
                      🕐 {fmtDateTime(t.departAt)}
                    </p>
                    <p className="text-sm text-ink-muted mt-0.5">
                      🚗 {t.carModel} · {t.driverName}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-brand-700 font-bold text-lg">{t.pricePerSeat.toLocaleString()}</p>
                    <p className="text-xs text-ink-muted">so'm / o'rindiq</p>
                    <span className={`badge mt-2 ${t.freeSeats > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {t.freeSeats > 0 ? `${t.freeSeats} bo'sh joy` : "Joy yo'q"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
