import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useUser } from "../../lib/useUser";
import { apiFetch } from "../../lib/api";
import { defaultSeatLayout } from "../../lib/seatLayout";
import SeatMap from "../../components/SeatMap";

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

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [pickup, setPickup] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupNote, setPickupNote] = useState("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
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
      setError("Avval o'rindiq tanlang");
      return;
    }
    setBooking(true);
    setError("");
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
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBooking(false);
    }
  };

  if (notFound) return <div className="p-6 text-center text-gray-500">Qatnov topilmadi.</div>;
  if (!trip) return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;

  const layout = trip.seatLayout && trip.seatLayout.length > 0 ? trip.seatLayout : null;
  const seatDefs = layout
    ? defaultSeatLayout(trip.totalSeats).filter((s) => layout.includes(s.id))
    : defaultSeatLayout(trip.totalSeats);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-xl shadow p-5">
        <h1 className="text-2xl font-bold mb-1">
          {trip.fromCity} → {trip.toCity}
        </h1>
        <p className="text-gray-600">{new Date(trip.departAt).toLocaleString("uz-UZ")}</p>
        <p className="text-gray-600">
          {trip.carModel} · {trip.carPlate} {trip.carColor && `· ${trip.carColor}`}
        </p>
        <p className="text-gray-600">
          Haydovchi: {trip.driverName}
          {trip.driverPhone && (
            <>
              {" "}
              ·{" "}
              <a href={`tel:${trip.driverPhone}`} className="text-blue-600 underline">
                {trip.driverPhone}
              </a>
            </>
          )}{" "}
          ·{" "}
          <a href={`/driver/${trip.driverQrCodeId}`} className="text-blue-600 underline">
            profilga o'tish
          </a>
        </p>
        {!trip.driverPhone && (
          <p className="text-xs text-gray-400">Haydovchi raqamini ko'rish uchun tizimga kiring</p>
        )}
        <p className="text-blue-700 font-bold text-lg mt-2">
          {trip.pricePerSeat.toLocaleString()} so'm / o'rindiq
        </p>
      </div>

      {trip.status === "FULL" ? (
        <p className="text-amber-600">Bu qatnovda barcha o'rindiqlar band qilingan (To'ldi).</p>
      ) : trip.status !== "SCHEDULED" ? (
        <p className="text-amber-600">Bu qatnov uchun endi bron qilib bo'lmaydi.</p>
      ) : success ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4">
          ✅ Bron muvaffaqiyatli amalga oshirildi! Haydovchi yo'lga chiqqanda sizga xabar boradi.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold mb-3">O'rindiqni tanlang</h2>
            <SeatMap
              layout={seatDefs}
              bookedSeatIds={trip.bookedSeats}
              selectedSeatId={selectedSeat}
              onSelect={setSelectedSeat}
            />
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold mb-3">Sizni qayerdan olib ketish kerak?</h2>
            <LocationPicker onChange={(lat, lng) => setPickup({ lat, lng })} />
            <input
              placeholder="Manzil haqida izoh (ixtiyoriy)"
              value={pickupNote}
              onChange={(e) => setPickupNote(e.target.value)}
              className="w-full p-2 border rounded mt-3"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={submitBooking}
            disabled={booking || !selectedSeat}
            className="w-full bg-green-600 text-white p-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {booking ? "Bron qilinmoqda..." : !selectedSeat ? "Avval o'rindiq tanlang" : "Bron qilish"}
          </button>
        </>
      )}
    </div>
  );
}
