import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useUser } from "../../lib/useUser";
import { apiFetch } from "../../lib/api";
import { defaultSeatLayout } from "../../lib/seatLayout";
import { fmtDateTime } from "../../lib/date";
import SeatMap from "../../components/SeatMap";
import PageHead from "../../components/ui/PageHead";
import { PageLoader } from "../../components/ui/Spinner";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import TripStatusBadge from "../../components/ui/TripStatusBadge";
import { useToast } from "../../components/ui/Toast";

const LocationPicker = dynamic(() => import("../../components/LocationPicker"), { ssr: false });

interface TripDetail {
  id: string;
  fromCity: string;
  toCity: string;
  departAt: string;
  pricePerSeat: number;
  totalSeats: number;
  seatLayout: string[] | null;
  status: string;
  carModel: string;
  carPlate: string;
  carColor: string | null;
  driverName: string;
  driverPhone: string | null;
  driverQrCodeId: string;
  bookedSeats: string[];
}

export default function TripDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const toast = useToast();

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [pickup, setPickup] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupNote, setPickupNote] = useState("");
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  const load = () => {
    if (!id) return;
    apiFetch<TripDetail>(`/api/trips/${id}`)
      .then(setTrip)
      .catch(() => setNotFound(true));
  };

  useEffect(load, [id]);

  const submitBooking = async () => {
    if (!user) {
      router.push(`/login?next=/trip/${id}`);
      return;
    }
    if (!selectedSeat) {
      toast.error("Avval o'rindiq tanlang");
      return;
    }
    setBooking(true);
    try {
      await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          tripId: id,
          seatNumber: selectedSeat,
          pickupLat: pickup?.lat,
          pickupLng: pickup?.lng,
          pickupNote,
        }),
      });
      setSuccess(true);
      toast.success("Bron qilindi!");
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBooking(false);
    }
  };

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="card">
          <EmptyState icon="🚫" title="Qatnov topilmadi" description="Bu qatnov o'chirilgan yoki havola noto'g'ri." />
        </div>
      </div>
    );
  }
  if (!trip) return <PageLoader />;

  const layout = trip.seatLayout && trip.seatLayout.length > 0 ? trip.seatLayout : null;
  const seatDefs = layout
    ? defaultSeatLayout(trip.totalSeats).filter((s) => layout.includes(s.id))
    : defaultSeatLayout(trip.totalSeats);

  const canBook = trip.status === "SCHEDULED" && !success;

  return (
    <>
      <PageHead title={`${trip.fromCity} → ${trip.toCity}`} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Qatnov sarlavha kartasi */}
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-5">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold flex items-center gap-2 flex-wrap">
                <span>{trip.fromCity}</span>
                <span className="opacity-70">→</span>
                <span>{trip.toCity}</span>
              </h1>
              <TripStatusBadge status={trip.status} />
            </div>
            <p className="text-brand-50 text-sm mt-2">
              🕐 {fmtDateTime(trip.departAt)}
            </p>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink">{trip.carModel}</p>
                <p className="text-sm text-ink-muted">
                  {trip.carPlate}{trip.carColor && ` · ${trip.carColor}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-brand-700 font-bold text-xl">{trip.pricePerSeat.toLocaleString()}</p>
                <p className="text-xs text-ink-muted">so'm / o'rindiq</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-ink-soft">👤 {trip.driverName}</p>
                {trip.driverPhone ? (
                  <a href={`tel:${trip.driverPhone}`} className="text-sm text-brand-600 font-medium">
                    📞 {trip.driverPhone}
                  </a>
                ) : (
                  <p className="text-xs text-ink-faint">Raqamni ko'rish uchun tizimga kiring</p>
                )}
              </div>
              <a href={`/driver/${trip.driverQrCodeId}`} className="btn-ghost text-sm !px-3 !py-1.5">
                Profil →
              </a>
            </div>
          </div>
        </div>

        {/* Holatlar */}
        {trip.status === "FULL" ? (
          <div className="card-pad bg-purple-50 border-purple-200 text-purple-800 text-sm text-center">
            🪑 Bu qatnovda barcha o'rindiqlar band qilingan (To'ldi).
          </div>
        ) : trip.status !== "SCHEDULED" ? (
          <div className="card-pad bg-amber-50 border-amber-200 text-amber-800 text-sm text-center">
            Bu qatnov uchun endi bron qilib bo'lmaydi.
          </div>
        ) : success ? (
          <div className="card-pad bg-emerald-50 border-emerald-200 text-emerald-800 text-center">
            <div className="text-3xl mb-1">✅</div>
            <p className="font-semibold">Bron muvaffaqiyatli amalga oshirildi!</p>
            <p className="text-sm mt-1">Haydovchi yo'lga chiqqanda sizga xabar boradi.</p>
          </div>
        ) : null}

        {canBook && (
          <>
            {/* O'rindiq tanlash */}
            <div className="card-pad">
              <h2 className="section-title mb-1">O'rindiqni tanlang</h2>
              <p className="text-sm text-ink-muted mb-4">Avtomobil maketidan bo'sh joyni belgilang</p>
              <div className="flex justify-center">
                <SeatMap
                  layout={seatDefs}
                  bookedSeatIds={trip.bookedSeats}
                  selectedSeatId={selectedSeat}
                  onSelect={setSelectedSeat}
                />
              </div>
            </div>

            {/* Xaritadan manzil */}
            <div className="card-pad">
              <h2 className="section-title mb-1">Sizni qayerdan olib ketamiz?</h2>
              <p className="text-sm text-ink-muted mb-4">Xaritada aniq nuqtani belgilang</p>
              <LocationPicker onChange={(lat, lng) => setPickup({ lat, lng })} />
              <input
                placeholder="Manzil haqida izoh (ixtiyoriy)"
                value={pickupNote}
                onChange={(e) => setPickupNote(e.target.value)}
                className="input mt-3"
              />
            </div>

            {/* Yakuniy tugma — mobil uchun pastda yopishib turadi */}
            <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-surface-page/80 backdrop-blur-sm border-t border-slate-100">
              <button
                onClick={submitBooking}
                disabled={booking || !selectedSeat}
                className="btn-success btn-block btn-lg"
              >
                {booking ? (
                  <Spinner className="w-5 h-5" />
                ) : !selectedSeat ? (
                  "Avval o'rindiq tanlang"
                ) : (
                  `Bron qilish · ${trip.pricePerSeat.toLocaleString()} so'm`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
