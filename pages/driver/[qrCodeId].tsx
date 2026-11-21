import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useUser } from "../../lib/useUser";
import { apiFetch } from "../../lib/api";
import { fmtDateTime } from "../../lib/date";
import PageHead from "../../components/ui/PageHead";
import { PageLoader } from "../../components/ui/Spinner";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/Toast";

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
  const toast = useToast();

  const [driver, setDriver] = useState<PublicDriver | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

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
    try {
      await apiFetch("/api/subscriptions", { method: "POST", body: JSON.stringify({ qrCodeId }) });
      setSubscribed(true);
      toast.success("Obuna bo'ldingiz!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (notFound) {
    return (
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="card">
          <EmptyState icon="🚫" title="Haydovchi topilmadi" description="Havola noto'g'ri yoki haydovchi o'chirilgan." />
        </div>
      </div>
    );
  }
  if (!driver) return <PageLoader />;

  const initials = driver.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <PageHead title={driver.fullName} />
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="card overflow-hidden">
          {/* Sarlavha */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 text-2xl font-bold flex items-center justify-center mx-auto mb-3">
              {initials}
            </div>
            <h1 className="text-xl font-bold">{driver.fullName}</h1>
            <p className="text-brand-50 text-sm mt-1">
              {driver.carModel} · {driver.carPlate}{driver.carColor && ` · ${driver.carColor}`}
            </p>
            <p className="text-brand-100 text-xs mt-2">👥 {driver.subscriberCount} obunachi</p>
          </div>

          <div className="p-5 space-y-4">
            {driver.defaultFrom && driver.defaultTo && (
              <div className="bg-surface-sunken rounded-xl px-4 py-3 text-sm text-center">
                <span className="text-ink-muted">Doimiy yo'nalish</span>
                <p className="font-semibold text-ink mt-0.5">{driver.defaultFrom} → {driver.defaultTo}</p>
                {driver.defaultPrice && (
                  <p className="text-ink-muted text-xs">{driver.defaultPrice.toLocaleString()} so'm / o'rindiq</p>
                )}
              </div>
            )}

            {driver.upcomingTrips.length > 0 && (
              <div>
                <h2 className="label">Yaqin qatnovlar</h2>
                <div className="space-y-2">
                  {driver.upcomingTrips.map((t) => (
                    <Link key={t.id} href={`/trip/${t.id}`} className="block bg-surface-sunken rounded-xl px-3 py-2.5 text-sm hover:bg-brand-50 transition-colors">
                      <span className="font-medium text-ink">{t.fromCity} → {t.toCity}</span>
                      <span className="text-ink-muted block text-xs mt-0.5">
                        🕐 {fmtDateTime(t.departAt)} · {t.pricePerSeat.toLocaleString()} so'm
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {subscribed ? (
              <div className="bg-emerald-50 text-emerald-700 rounded-xl py-3 text-center font-medium">
                ✅ Siz obuna bo'ldingiz!
              </div>
            ) : (
              <button onClick={subscribe} disabled={busy} className="btn-primary btn-block btn-lg">
                {busy ? <Spinner className="w-5 h-5" /> : "🔔 Obuna bo'lish"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
