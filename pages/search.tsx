import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../lib/api";
import { cities } from "../data/cities";

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
  const [loading, setLoading] = useState(false);
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
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Qatnov qidirish</h1>

      <div className="bg-white rounded-xl shadow p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="p-2 border rounded">
          <option value="">Qayerdan</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={to} onChange={(e) => setTo(e.target.value)} className="p-2 border rounded">
          <option value="">Qayerga</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 border rounded" />
        <input
          type="number"
          placeholder="Maks. narx"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="p-2 border rounded"
        />
        <button onClick={runSearch} className="bg-blue-600 text-white p-2 rounded">
          Qidirish
        </button>
      </div>

      {loading && <p className="text-gray-500">Yuklanmoqda...</p>}
      {!loading && searched && trips.length === 0 && (
        <p className="text-gray-500">Hech qanday qatnov topilmadi.</p>
      )}

      <div className="space-y-3">
        {trips.map((t) => (
          <Link
            key={t.id}
            href={`/trip/${t.id}`}
            className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <p className="font-semibold text-lg">
                  {t.fromCity} → {t.toCity}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(t.departAt).toLocaleString("uz-UZ")} · {t.carModel} · {t.driverName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-blue-700 font-bold">{t.pricePerSeat.toLocaleString()} so'm</p>
                <p className="text-sm text-gray-500">{t.freeSeats} bo'sh joy</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
