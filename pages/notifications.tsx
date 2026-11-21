import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useUser } from "../lib/useUser";
import { apiFetch } from "../lib/api";
import { fmtDateTime } from "../lib/date";
import PageHead from "../components/ui/PageHead";
import { PageLoader } from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  tripId: string | null;
  isRead: boolean;
  createdAt: string;
}

const ICONS: Record<string, string> = {
  NEW_TRIP: "🚦",
  TRIP_STARTED: "🚗",
  BOOKING_CONFIRMED: "✅",
  NEW_BOOKING: "🎫",
  BOOKING_CANCELLED: "❌",
  TRIP_FULL: "🪑",
  NEW_SUBSCRIBER: "🔔",
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [items, setItems] = useState<Notification[]>([]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      apiFetch<{ notifications: Notification[] }>("/api/notifications")
        .then((d) => setItems(d.notifications))
        .catch(() => {})
        .finally(() => setFetched(true));
      apiFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({}) }).catch(() => {});
    }
  }, [loading, user, router]);

  if (loading || !user || !fetched) return <PageLoader />;

  return (
    <>
      <PageHead title="Bildirishnomalar" />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-ink mb-4">Bildirishnomalar</h1>
        {items.length === 0 ? (
          <div className="card">
            <EmptyState icon="🔕" title="Bildirishnoma yo'q" description="Yangi qatnov va bronlar haqida xabarlar shu yerda ko'rinadi." />
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <div key={n.id} className={`card-pad flex gap-3 ${!n.isRead ? "ring-1 ring-brand-100 bg-brand-50/30" : ""}`}>
                <div className="w-10 h-10 rounded-full bg-surface-sunken flex items-center justify-center text-lg flex-shrink-0">
                  {ICONS[n.type] || "🔔"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-semibold text-ink">{n.title}</p>
                    <span className="text-xs text-ink-faint whitespace-nowrap flex-shrink-0">
                      {fmtDateTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-ink-muted text-sm mt-0.5 break-words">{n.body}</p>
                  {n.tripId && (
                    <Link href={`/trip/${n.tripId}`} className="text-brand-600 text-sm font-medium mt-1.5 inline-block hover:underline">
                      Qatnovni ko'rish →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
