import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "../lib/useUser";
import { apiFetch } from "../lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  tripId: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      apiFetch<{ notifications: Notification[] }>("/api/notifications")
        .then((d) => setItems(d.notifications))
        .catch(() => {});
      apiFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({}) }).catch(() => {});
    }
  }, [loading, user, router]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bildirishnomalar</h1>
      {items.length === 0 && <p className="text-gray-500">Hozircha bildirishnomalar yo'q.</p>}
      <div className="space-y-3">
        {items.map((n) => (
          <div
            key={n.id}
            className={`bg-white rounded-xl shadow p-4 ${!n.isRead ? "border-l-4 border-blue-600" : ""}`}
          >
            <div className="flex justify-between items-start gap-2">
              <p className="font-semibold">{n.title}</p>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {new Date(n.createdAt).toLocaleString("uz-UZ")}
              </span>
            </div>
            <p className="text-gray-600 text-sm mt-1">{n.body}</p>
            {n.tripId && (
              <a href={`/trip/${n.tripId}`} className="text-blue-600 text-sm underline mt-1 inline-block">
                Qatnovni ko'rish →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
