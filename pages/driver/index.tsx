import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import QRCode from "qrcode";
import { useUser } from "../../lib/useUser";
import { apiFetch } from "../../lib/api";
import { cities } from "../../data/cities";
import { defaultSeatLayout, seatLabel } from "../../lib/seatLayout";
import SeatMap from "../../components/SeatMap";

interface TripBooking {
  seatNumber: string;
  pickupLat: number | null;
  pickupLng: number | null;
  pickupNote: string | null;
  passenger: { fullName: string; phone: string };
}

interface Trip {
  id: string;
  fromCity: string;
  toCity: string;
  departAt: string;
  pricePerSeat: number;
  totalSeats: number;
  status: string;
  bookings: TripBooking[];
}

export default function DriverDashboard() {
  const router = useRouter();
  const { user, loading, refresh } = useUser();

  const [carModel, setCarModel] = useState("");
  const [carPlate, setCarPlate] = useState("");
  const [carColor, setCarColor] = useState("");
  const [totalSeats, setTotalSeats] = useState(4);
  const [defaultFrom, setDefaultFrom] = useState("");
  const [defaultTo, setDefaultTo] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const [trips, setTrips] = useState<Trip[]>([]);
  const [announcing, setAnnouncing] = useState(false);
  const [announceError, setAnnounceError] = useState("");
  const [customDepart, setCustomDepart] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user?.driver) {
      setCarModel(user.driver.carModel);
      setCarPlate(user.driver.carPlate);
      setCarColor(user.driver.carColor || "");
      setTotalSeats(user.driver.totalSeats);
      setDefaultFrom(user.driver.defaultFrom || "");
      setDefaultTo(user.driver.defaultTo || "");
      setDefaultPrice(user.driver.defaultPrice ? String(user.driver.defaultPrice) : "");

      const url = `${window.location.origin}/driver/${user.driver.qrCodeId}`;
      setShareUrl(url);
      QRCode.toDataURL(url, { margin: 1, width: 220, color: { dark: "#1e3a8a", light: "#ffffff" } }).then(
        setQrDataUrl
      );

      loadTrips();
    } else if (user && !user.driver) {
      setEditingProfile(true);
    }
  }, [user]);

  const loadTrips = async () => {
    try {
      const data = await apiFetch<Trip[]>("/api/driver/trips");
      setTrips(data);
    } catch {
      // ignore
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setSavingProfile(true);
    try {
      await apiFetch("/api/driver/profile", {
        method: "POST",
        body: JSON.stringify({
          carModel,
          carPlate,
          carColor,
          totalSeats,
          defaultFrom: defaultFrom || null,
          defaultTo: defaultTo || null,
          defaultPrice: defaultPrice || null,
        }),
      });
      setEditingProfile(false);
      await refresh();
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const announceTrip = async () => {
    setAnnounceError("");
    setAnnouncing(true);
    try {
      await apiFetch("/api/driver/trips", {
        method: "POST",
        body: JSON.stringify(customDepart ? { departAt: customDepart } : {}),
      });
      setCustomDepart("");
      await loadTrips();
    } catch (err: any) {
      setAnnounceError(err.message);
    } finally {
      setAnnouncing(false);
    }
  };

  const startTrip = async (tripId: string) => {
    try {
      await apiFetch(`/api/driver/trips/${tripId}/start`, { method: "POST" });
      await loadTrips();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading || !user) return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Haydovchi paneli</h1>

      {/* Profil */}
      <section className="bg-white rounded-xl shadow p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Moshina va doimiy yo'nalish</h2>
          {user.driver && !editingProfile && (
            <button onClick={() => setEditingProfile(true)} className="text-blue-600 text-sm underline">
              Tahrirlash
            </button>
          )}
        </div>

        {!editingProfile && user.driver ? (
          <div className="text-gray-700 space-y-1">
            <p>
              <strong>{user.driver.carModel}</strong> · {user.driver.carPlate}{" "}
              {user.driver.carColor && `· ${user.driver.carColor}`}
            </p>
            <p>Bo'sh o'rindiqlar: {user.driver.totalSeats}</p>
            {user.driver.defaultFrom && user.driver.defaultTo && (
              <p>
                Doimiy yo'nalish: {user.driver.defaultFrom} → {user.driver.defaultTo} (
                {user.driver.defaultPrice?.toLocaleString()} so'm/o'rindiq)
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={saveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Moshina modeli (masalan: Chevrolet Cobalt)"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
              className="p-2 border rounded"
              required
            />
            <input
              placeholder="Davlat raqami"
              value={carPlate}
              onChange={(e) => setCarPlate(e.target.value)}
              className="p-2 border rounded"
              required
            />
            <input
              placeholder="Rangi (ixtiyoriy)"
              value={carColor}
              onChange={(e) => setCarColor(e.target.value)}
              className="p-2 border rounded"
            />
            <select
              value={totalSeats}
              onChange={(e) => setTotalSeats(Number(e.target.value))}
              className="p-2 border rounded"
            >
              {[2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  {n} bo'sh o'rindiq
                </option>
              ))}
            </select>
            <select value={defaultFrom} onChange={(e) => setDefaultFrom(e.target.value)} className="p-2 border rounded">
              <option value="">Qayerdan (doimiy, ixtiyoriy)</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select value={defaultTo} onChange={(e) => setDefaultTo(e.target.value)} className="p-2 border rounded">
              <option value="">Qayerga (doimiy, ixtiyoriy)</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Narx (1 o'rindiq uchun, so'm)"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(e.target.value)}
              className="p-2 border rounded"
            />

            <div className="md:col-span-2">
              <p className="text-xs text-gray-500 mb-2">O'rindiqlar maketi:</p>
              <SeatMap layout={defaultSeatLayout(totalSeats)} readOnly />
            </div>

            {profileError && <p className="text-red-500 text-sm md:col-span-2">{profileError}</p>}
            <button
              type="submit"
              disabled={savingProfile}
              className="md:col-span-2 bg-blue-600 text-white p-2 rounded disabled:opacity-50"
            >
              {savingProfile ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </form>
        )}
      </section>

      {user.driver && (
        <>
          {/* Tez e'lon qilish */}
          <section className="bg-white rounded-xl shadow p-5">
            <h2 className="text-lg font-semibold mb-3">Yangi qatnov e'lon qilish</h2>
            <p className="text-sm text-gray-500 mb-3">
              Bir tugma bosish orqali doimiy yo'nalishingiz bo'yicha darhol e'lon joylang, yoki jo'nash
              vaqtini o'zgartiring.
            </p>
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
              <input
                type="datetime-local"
                value={customDepart}
                onChange={(e) => setCustomDepart(e.target.value)}
                className="p-2 border rounded"
              />
              <button
                onClick={announceTrip}
                disabled={announcing || !user.driver.defaultFrom}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {announcing ? "E'lon qilinmoqda..." : "🚗 Yo'lga chiqaman — e'lon qilish"}
              </button>
            </div>
            {!user.driver.defaultFrom && (
              <p className="text-amber-600 text-sm mt-2">
                Tez e'lon qilish uchun avval yuqorida doimiy yo'nalishni to'ldiring.
              </p>
            )}
            {announceError && <p className="text-red-500 text-sm mt-2">{announceError}</p>}
          </section>

          {/* QR */}
          <section className="bg-white rounded-xl shadow p-5 flex flex-col md:flex-row gap-5 items-center">
            {qrDataUrl && <img src={qrDataUrl} alt="QR kod" className="w-40 h-40 rounded-lg border" />}
            <div>
              <h2 className="text-lg font-semibold mb-1">Shaxsiy QR-kodingiz</h2>
              <p className="text-sm text-gray-600 mb-2">
                Yo'lovchilar ushbu QR-kodni skanerlab sizga obuna bo'lishadi va yangi qatnov e'lon
                qilganingizda avtomatik xabar olishadi.
              </p>
              <input
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full p-2 border rounded text-sm text-gray-600"
              />
            </div>
          </section>

          {/* Qatnovlar */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Sizning qatnovlaringiz</h2>
            {trips.length === 0 && <p className="text-gray-500">Hali qatnov e'lon qilinmagan.</p>}
            <div className="space-y-4">
              {trips.map((trip) => (
                <div key={trip.id} className="bg-white rounded-xl shadow p-4">
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                    <div>
                      <p className="font-semibold">
                        {trip.fromCity} → {trip.toCity}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(trip.departAt).toLocaleString("uz-UZ")} ·{" "}
                        {trip.pricePerSeat.toLocaleString()} so'm/o'rindiq ·{" "}
                        {trip.bookings.length}/{trip.totalSeats} band
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={trip.status} />
                      {(trip.status === "SCHEDULED" || trip.status === "FULL") && (
                        <button
                          onClick={() => startTrip(trip.id)}
                          className="bg-blue-600 text-white text-sm px-3 py-1 rounded"
                        >
                          Yo'lga chiqdim
                        </button>
                      )}
                    </div>
                  </div>
                  <SeatMap
                    layout={defaultSeatLayout(trip.totalSeats)}
                    bookedSeatIds={trip.bookings.map((b) => b.seatNumber)}
                    readOnly
                  />
                  {trip.bookings.length > 0 && (
                    <div className="mt-3 border-t pt-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Yo'lovchilar</p>
                      {trip.bookings.map((b) => (
                        <div key={b.seatNumber} className="text-sm bg-gray-50 rounded-lg p-2">
                          <p className="font-medium">
                            {seatLabel(b.seatNumber)} — {b.passenger.fullName}{" "}
                            <a href={`tel:${b.passenger.phone}`} className="text-blue-600">
                              {b.passenger.phone}
                            </a>
                          </p>
                          <p className="text-gray-500 break-words">
                            {b.pickupNote && <span>{b.pickupNote} · </span>}
                            {b.pickupLat != null && b.pickupLng != null ? (
                              <a
                                href={`https://www.google.com/maps?q=${b.pickupLat},${b.pickupLng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline"
                              >
                                Xaritada ko'rish
                              </a>
                            ) : (
                              <span>manzil belgilanmagan</span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    SCHEDULED: { label: "E'lon qilingan", cls: "bg-yellow-100 text-yellow-800" },
    FULL: { label: "To'ldi", cls: "bg-purple-100 text-purple-800" },
    STARTED: { label: "Yo'lda", cls: "bg-blue-100 text-blue-800" },
    FINISHED: { label: "Yakunlangan", cls: "bg-gray-100 text-gray-600" },
    CANCELLED: { label: "Bekor qilingan", cls: "bg-red-100 text-red-700" },
  };
  const s = map[status] || map.SCHEDULED;
  return <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.cls}`}>{s.label}</span>;
}
