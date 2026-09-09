import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "../lib/useUser";
import { apiFetch } from "../lib/api";

export default function Navbar() {
  const { user } = useUser();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = () => {
      apiFetch<{ unreadCount: number }>("/api/notifications")
        .then((d) => setUnread(d.unreadCount))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 20000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="bg-white shadow py-3 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
        <Link href="/" className="text-xl font-bold text-blue-700">
          🚕 YoʻlYoʻldosh
        </Link>
        <div className="flex gap-4 text-sm items-center">
          <Link href="/search" className="text-gray-800 hover:text-blue-600">
            Qatnov qidirish
          </Link>
          <Link href="/scan" className="text-gray-800 hover:text-blue-600">
            QR skanerlash
          </Link>
          {user?.role === "DRIVER" && (
            <Link href="/driver" className="text-gray-800 hover:text-blue-600">
              Haydovchi paneli
            </Link>
          )}
          {user && (
            <Link href="/notifications" className="relative text-gray-800 hover:text-blue-600">
              🔔
              {unread > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <Link href="/profile" className="text-gray-800 hover:text-blue-600">
              Profil
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-gray-800 hover:text-blue-600">
                Kirish
              </Link>
              <Link href="/register" className="text-gray-800 hover:text-blue-600">
                Ro'yxatdan o'tish
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
