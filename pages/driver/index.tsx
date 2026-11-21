import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import QRCode from "qrcode";
import { useUser } from "../../lib/useUser";
import { apiFetch } from "../../lib/api";
import { cities } from "../../data/cities";
import { defaultSeatLayout, seatLabel } from "../../lib/seatLayout";
import { fmtDateTime } from "../../lib/date";
import SeatMap from "../../components/SeatMap";
import PageHead from "../../components/ui/PageHead";
import { PageLoader } from "../../components/ui/Spinner";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import TripStatusBadge from "../../components/ui/TripStatusBadge";
import { useToast } from "../../components/ui/Toast";

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
  const toast = useToast();

  const [carModel, setCarModel] = useState("");
  const [carPlate, setCarPlate] = useState("");
  const [carColor, setCarColor] = useState("");
  const [totalSeats, setTotalSeats] = useState(4);
  const [defaultFrom, setDefaultFrom] = useState("");
  const [defaultTo, setDefaultTo] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const [trips, setTrips] = useState<Trip[]>([]);
  const [announcing, setAnnouncing] = useState(false);
  const [customDepart, setCustomDepart] = useState("");
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
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
      QRCode.toDataURL(url, { margin: 1, width: 240, color: { dark: "#1e3a8a", light: "#ffffff" } }).then(setQrDataUrl);

      loadTrips();
    } else if (user && !user.driver) {
      setEditingProfile(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadTrips = async () => {
    try {
      setTrips(await apiFetch<Trip[]>("/api/driver/trips"));
    } catch {
      /* ignore */
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast.success("Profil saqlandi");
      await refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const announceTrip = async () => {
    setAnnouncing(true);
    try {
      await apiFetch("/api/driver/trips", {
        method: "POST",
        body: JSON.stringify(customDepart ? { departAt: customDepart } : {}),
      });
      setCustomDepart("");
      toast.success("Qatnov e'lon qilindi! Obunachilarga xabar yuborildi.");
      await loadTrips();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAnnouncing(false);
    }
  };

  const startTrip = async (tripId: string) => {
    setStartingId(tripId);
    try {
      await apiFetch(`/api/driver/trips/${tripId}/start`, { method: "POST" });
      toast.success("Yo'lovchilarga xabar yuborildi!");
      await loadTrips();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setStartingId(null);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Havola nusxalandi");
    } catch {
      toast.info("Havolani qo'lda nusxalang");
    }
  };

  if (loading || !user) return <PageLoader />;

  return (
    <>
      <PageHead title="Haydovchi paneli" />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <h1 className="text-2xl font-bold text-ink">Haydovchi paneli</h1>

        {/* Profil */}
        <section className="card-pad">
          <div className="flex justify-between items-center mb-4">
            <h2 className="section-title">🚘 Moshina va yo'nalish</h2>
            {user.driver && !editingProfile && (
              <button onClick={() => setEditingProfile(true)} className="btn-ghost text-sm !px-3 !py-1.5">
                Tahrirlash
              </button>
            )}
          </div>

          {!editingProfile && user.driver ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-xl">🚗</span>
                <div>
                  <p className="font-semibold text-ink">{user.driver.carModel}</p>
                  <p className="text-sm text-ink-muted">
                    {user.driver.carPlate}{user.driver.carColor && ` · ${user.driver.carColor}`} · {user.driver.totalSeats} o'rindiq
                  </p>
                </div>
              </div>
              {user.driver.defaultFrom && user.driver.defaultTo && (
                <div className="bg-surface-sunken rounded-xl px-4 py-3 text-sm">
                  <span className="text-ink-muted">Doimiy yo'nalish: </span>
                  <span className="font-medium text-ink">{user.driver.defaultFrom} → {user.driver.defaultTo}</span>
                  {user.driver.defaultPrice && (
                    <span className="text-ink-muted"> · {user.driver.defaultPrice.toLocaleString()} so'm/o'rindiq</span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={saveProfile} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Moshina modeli</label>
                  <input placeholder="Chevrolet Cobalt" value={carModel} onChange={(e) => setCarModel(e.target.value)} className="input" required />
                </div>
                <div>
                  <label className="label">Davlat raqami</label>
                  <input placeholder="01 A 123 BC" value={carPlate} onChange={(e) => setCarPlate(e.target.value)} className="input" required />
                </div>
                <div>
                  <label className="label">Rangi (ixtiyoriy)</label>
                  <input placeholder="Oq" value={carColor} onChange={(e) => setCarColor(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="label">Bo'sh o'rindiqlar</label>
                  <select value={totalSeats} onChange={(e) => setTotalSeats(Number(e.target.value))} className="select">
                    {[2, 3, 4, 5, 6, 7].map((n) => (
                      <option key={n} value={n}>{n} o'rindiq</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Qayerdan (doimiy)</label>
                  <select value={defaultFrom} onChange={(e) => setDefaultFrom(e.target.value)} className="select">
                    <option value="">Tanlanmagan</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Qayerga (doimiy)</label>
                  <select value={defaultTo} onChange={(e) => setDefaultTo(e.target.value)} className="select">
                    <option value="">Tanlanmagan</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Narx (1 o'rindiq uchun, so'm)</label>
                  <input type="number" inputMode="numeric" placeholder="80000" value={defaultPrice} onChange={(e) => setDefaultPrice(e.target.value)} className="input" />
                </div>
              </div>

              <div>
                <p className="label">O'rindiqlar maketi (ko'rinishi):</p>
                <div className="flex justify-center">
                  <SeatMap layout={defaultSeatLayout(totalSeats)} readOnly />
                </div>
              </div>

              <button type="submit" disabled={savingProfile} className="btn-primary btn-block">
                {savingProfile ? <Spinner className="w-5 h-5" /> : "Saqlash"}
              </button>
            </form>
          )}
        </section>

        {user.driver && (
          <>
            {/* Tez e'lon */}
            <section className="card-pad bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
              <h2 className="section-title mb-1">⚡ Yangi qatnov e'lon qilish</h2>
              <p className="text-sm text-ink-muted mb-4">
                Bir tugma bilan doimiy yo'nalishingiz bo'yicha darhol e'lon joylang.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="datetime-local"
                  value={customDepart}
                  onChange={(e) => setCustomDepart(e.target.value)}
                  className="input sm:flex-1"
                />
                <button onClick={announceTrip} disabled={announcing || !user.driver.defaultFrom} className="btn-success whitespace-nowrap">
                  {announcing ? <Spinner className="w-5 h-5" /> : "🚗 Yo'lga chiqaman"}
                </button>
              </div>
              {!user.driver.defaultFrom && (
                <p className="text-amber-600 text-sm mt-2">
                  ⚠️ Avval yuqorida doimiy yo'nalishni to'ldiring.
                </p>
              )}
            </section>

            {/* QR */}
            <section className="card-pad">
              <h2 className="section-title mb-4">📱 Shaxsiy QR-kodingiz</h2>
              <div className="flex flex-col sm:flex-row gap-5 items-center">
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR kod" className="w-40 h-40 rounded-xl border border-slate-200 flex-shrink-0" />
                )}
                <div className="flex-1 w-full">
                  <p className="text-sm text-ink-muted mb-3">
                    Yo'lovchilar ushbu QR-kodni skanerlab sizga obuna bo'lishadi va yangi qatnov e'lon qilganingizda avtomatik xabar olishadi.
                  </p>
                  <div className="flex gap-2">
                    <input readOnly value={shareUrl} onClick={(e) => (e.target as HTMLInputElement).select()} className="input text-xs flex-1" />
                    <button onClick={copyLink} className="btn-secondary !px-3 whitespace-nowrap">Nusxa</button>
                  </div>
                </div>
              </div>
            </section>

            {/* Qatnovlar */}
            <section>
              <h2 className="section-title mb-3">Sizning qatnovlaringiz</h2>
              {trips.length === 0 ? (
                <div className="card">
                  <EmptyState icon="🗓️" title="Hali qatnov yo'q" description="Yuqoridagi tugma bilan birinchi qatnovingizni e'lon qiling." />
                </div>
              ) : (
                <div className="space-y-4">
                  {trips.map((trip) => (
                    <div key={trip.id} className="card-pad">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                        <div>
                          <p className="font-semibold text-ink">{trip.fromCity} → {trip.toCity}</p>
                          <p className="text-sm text-ink-muted mt-0.5">
                            🕐 {fmtDateTime(trip.departAt)}
                            {" · "}{trip.pricePerSeat.toLocaleString()} so'm
                          </p>
                          <p className="text-sm text-ink-muted">
                            🪑 {trip.bookings.length}/{trip.totalSeats} band
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <TripStatusBadge status={trip.status} />
                          {(trip.status === "SCHEDULED" || trip.status === "FULL") && (
                            <button onClick={() => startTrip(trip.id)} disabled={startingId === trip.id} className="btn-primary text-sm !px-3 !py-1.5">
                              {startingId === trip.id ? <Spinner className="w-4 h-4" /> : "Yo'lga chiqdim"}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <SeatMap layout={defaultSeatLayout(trip.totalSeats)} bookedSeatIds={trip.bookings.map((b) => b.seatNumber)} readOnly />
                      </div>

                      {trip.bookings.length > 0 && (
                        <div className="mt-4 border-t border-slate-100 pt-3 space-y-2">
                          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide">Yo'lovchilar</p>
                          {trip.bookings.map((b) => (
                            <div key={b.seatNumber} className="bg-surface-sunken rounded-xl p-3 text-sm">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-medium text-ink">
                                  <span className="badge bg-brand-100 text-brand-700 mr-1">{seatLabel(b.seatNumber)}</span>
                                  {b.passenger.fullName}
                                </p>
                                <a href={`tel:${b.passenger.phone}`} className="text-brand-600 font-medium whitespace-nowrap">📞 {b.passenger.phone}</a>
                              </div>
                              <p className="text-ink-muted break-words mt-1.5">
                                {b.pickupNote && <span>📍 {b.pickupNote} · </span>}
                                {b.pickupLat != null && b.pickupLng != null ? (
                                  <a href={`https://www.google.com/maps?q=${b.pickupLat},${b.pickupLng}`} target="_blank" rel="noreferrer" className="text-brand-600 underline">
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
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
