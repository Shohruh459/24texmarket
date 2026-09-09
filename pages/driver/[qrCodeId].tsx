import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "../../lib/useUser";
import { apiFetch } from "../../lib/api";

interface PublicDriver {
  id: string;
  fullName: string;
  carModel: string;
  carPlate: string;
  carColor: string | null;
  defaultFrom: string | null;
  defaultTo: string | null;
  defaultPrice: number | null;
  subscriberCount: number;
  upcomingTrips: { id: string; fromCity: string; toCity: string; departAt: string; pricePerSeat: number }[];
}

export default function DriverPublicPage() {
  const router = useRouter();
  const { qrCodeId } = router.query;
  const { user } = useUser();

  const [driver, setDriver] = useState<PublicDriver | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!qrCodeId) return;
    apiFetch<PublicDriver>(`/api/drivers/${qrCodeId}`)
      .then(setDriver)
      .catch(() => setNotFound(true));
  }, [qrCodeId]);

  const subscribe = async () => {
    if (!user) {
      router.push(`/login?next=/driver/${qrCodeId}`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiFetch("/api/subscriptions", {
        method: "POST",
        body: JSON.stringify({ qrCodeId }),
      });
      setSubscribed(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (notFound) return <div className="p-6 text-center text-gray-500">Haydovchi topilmadi.</div>;
  if (!driver) return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-bold mb-1">{driver.fullName}</h1>
      <p className="text-gray-600 mb-4">
        {driver.carModel} · {driver.carPlate} {driver.carColor && `· ${driver.carColor}`}
      </p>

      {driver.defaultFrom && driver.defaultTo && (
        <p className="text-gray-700 mb-2">
          Doimiy yo'nalish: <strong>{driver.defaultFrom} → {driver.defaultTo}</strong>
          {driver.defaultPrice && ` (${driver.defaultPrice.toLocaleString()} so'm/o'rindiq)`}
        </p>
      )}

      <p className="text-sm text-gray-500 mb-4">{driver.subscriberCount} kishi obuna bo'lgan</p>

      {driver.upcomingTrips.length > 0 && (
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Yaqin qatnovlar</h2>
          <ul className="space-y-1 text-sm">
            {driver.upcomingTrips.map((t) => (
              <li key={t.id}>
                <a href={`/trip/${t.id}`} className="text-blue-600 underline">
                  {t.fromCity} → {t.toCity} · {new Date(t.departAt).toLocaleString("uz-UZ")}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {subscribed ? (
        <p className="text-green-600 font-medium">✅ Siz obuna bo'ldingiz!</p>
      ) : (
        <button
          onClick={subscribe}
          disabled={busy}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {busy ? "..." : "🔔 Obuna bo'lish"}
        </button>
      )}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
