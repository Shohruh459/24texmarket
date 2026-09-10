import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "../lib/useUser";
import { apiFetch } from "../lib/api";

interface Booking {
  id: string;
  seatNumber: string;
  status: string;
  trip: {
    id: string;
    fromCity: string;
    toCity: string;
    departAt: string;
    status: string;
    pricePerSeat: number;
  };
}

interface SubscriptionItem {
  id: string;
  driver: { id: string; carModel: string; qrCodeId: string; user: { fullName: string } };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, setUser } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subs, setSubs] = useState<SubscriptionItem[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = () => {
    apiFetch<Booking[]>("/api/bookings").then(setBookings).catch(() => {});
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      loadBookings();
      apiFetch<SubscriptionItem[]>("/api/subscriptions").then(setSubs).catch(() => {});
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  const cancelBooking = async (id: string) => {
    if (!confirm("Bronni bekor qilishni tasdiqlaysizmi?")) return;
    setCancellingId(id);
    try {
      await apiFetch(`/api/bookings/${id}`, { method: "DELETE" });
      loadBookings();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading || !user) return <div className="p-6 text-center text-gray-500">Yuklanmoqda...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Profil</h1>
        <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded">
          Chiqish
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <p className="font-semibold">{user.fullName}</p>
        <p className="text-gray-600">{user.phone}</p>
        <p className="text-gray-600">Rol: {user.role === "DRIVER" ? "Haydovchi" : "Yo'lovchi"}</p>
        {user.role === "DRIVER" && (
          <a href="/driver" className="text-blue-600 underline text-sm mt-2 inline-block">
            Haydovchi paneliga o'tish →
          </a>
        )}
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-2">Mening bronlarim</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500">Hozircha bron mavjud emas.</p>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-xl shadow p-4">
                <a href={`/trip/${b.trip.id}`} className="block hover:opacity-80">
                  <p className="font-semibold">
                    {b.trip.fromCity} → {b.trip.toCity}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(b.trip.departAt).toLocaleString("uz-UZ")} · O'rindiq: {b.seatNumber} ·{" "}
                    {b.trip.pricePerSeat.toLocaleString()} so'm
                  </p>
                </a>
                {b.trip.status === "SCHEDULED" || b.trip.status === "FULL" ? (
                  <button
                    onClick={() => cancelBooking(b.id)}
                    disabled={cancellingId === b.id}
                    className="text-red-600 text-sm underline mt-2 disabled:opacity-50"
                  >
                    {cancellingId === b.id ? "Bekor qilinmoqda..." : "Bronni bekor qilish"}
                  </button>
                ) : (
                  <p className="text-xs text-gray-400 mt-2">Bu bron endi bekor qilinmaydi</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Obunalarim</h2>
        {subs.length === 0 ? (
          <p className="text-gray-500">Hozircha hech qaysi haydovchiga obuna emassiz.</p>
        ) : (
          <div className="space-y-2">
            {subs.map((s) => (
              <a
                key={s.id}
                href={`/driver/${s.driver.qrCodeId}`}
                className="block bg-white rounded-xl shadow p-4 hover:shadow-md"
              >
                <p className="font-semibold">{s.driver.user.fullName}</p>
                <p className="text-sm text-gray-500">{s.driver.carModel}</p>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
