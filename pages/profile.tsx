import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useUser } from "../lib/useUser";
import { apiFetch } from "../lib/api";
import { seatLabel } from "../lib/seatLayout";
import { fmtDateTime } from "../lib/date";
import PageHead from "../components/ui/PageHead";
import { PageLoader } from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import TripStatusBadge from "../components/ui/TripStatusBadge";
import { useToast } from "../components/ui/Toast";

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
  const toast = useToast();
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
      toast.success("Bron bekor qilindi");
      loadBookings();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading || !user) return <PageLoader />;

  const initials = user.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <PageHead title="Profil" />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Profil kartasi */}
        <div className="card-pad flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-600 text-white text-lg font-bold flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-ink text-lg truncate">{user.fullName}</p>
            <p className="text-sm text-ink-muted">{user.phone}</p>
            <span className="badge bg-slate-100 text-slate-600 mt-1">
              {user.role === "DRIVER" ? "🚗 Haydovchi" : "🧳 Yo'lovchi"}
            </span>
          </div>
          <button onClick={handleLogout} className="btn-secondary text-sm !px-3 self-start">
            Chiqish
          </button>
        </div>

        {user.role === "DRIVER" && (
          <Link href="/driver" className="card-pad flex items-center justify-between hover:shadow-card-hover transition-shadow">
            <span className="font-medium text-ink">🚘 Haydovchi paneli</span>
            <span className="text-brand-600">→</span>
          </Link>
        )}

        {/* Bronlar */}
        <section>
          <h2 className="section-title mb-3">🎫 Mening bronlarim</h2>
          {bookings.length === 0 ? (
            <div className="card">
              <EmptyState
                icon="🎫"
                title="Bron yo'q"
                description="Qatnov qidirib, o'rindiq bron qiling."
                action={<Link href="/search" className="btn-primary">Qatnov qidirish</Link>}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="card-pad">
                  <Link href={`/trip/${b.trip.id}`} className="block">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-ink">{b.trip.fromCity} → {b.trip.toCity}</p>
                      <TripStatusBadge status={b.trip.status} />
                    </div>
                    <p className="text-sm text-ink-muted mt-1">
                      🕐 {fmtDateTime(b.trip.departAt)}
                      {" · "}<span className="badge bg-brand-100 text-brand-700">{seatLabel(b.seatNumber)}</span>
                      {" · "}{b.trip.pricePerSeat.toLocaleString()} so'm
                    </p>
                  </Link>
                  {b.trip.status === "SCHEDULED" || b.trip.status === "FULL" ? (
                    <button
                      onClick={() => cancelBooking(b.id)}
                      disabled={cancellingId === b.id}
                      className="text-red-600 text-sm font-medium mt-2 disabled:opacity-50 hover:underline"
                    >
                      {cancellingId === b.id ? "Bekor qilinmoqda..." : "Bronni bekor qilish"}
                    </button>
                  ) : (
                    <p className="text-xs text-ink-faint mt-2">Bu bron endi bekor qilinmaydi</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Obunalar */}
        <section>
          <h2 className="section-title mb-3">🔔 Obunalarim</h2>
          {subs.length === 0 ? (
            <div className="card">
              <EmptyState icon="🔔" title="Obuna yo'q" description="Haydovchining QR-kodini skanerlab obuna bo'ling." />
            </div>
          ) : (
            <div className="space-y-3">
              {subs.map((s) => (
                <Link key={s.id} href={`/driver/${s.driver.qrCodeId}`} className="card-pad flex items-center gap-3 hover:shadow-card-hover transition-shadow">
                  <span className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-xl">🚗</span>
                  <div>
                    <p className="font-semibold text-ink">{s.driver.user.fullName}</p>
                    <p className="text-sm text-ink-muted">{s.driver.carModel}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
