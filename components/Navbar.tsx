import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUser } from "../lib/useUser";
import { apiFetch } from "../lib/api";

export default function Navbar() {
  const { user } = useUser();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    const close = () => setMenuOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  const links = (
    <>
      <Link href="/search" className="text-gray-800 hover:text-blue-600 py-2 md:py-0">
        Qatnov qidirish
      </Link>
      <Link href="/scan" className="text-gray-800 hover:text-blue-600 py-2 md:py-0">
        QR skanerlash
      </Link>
      {user?.role === "DRIVER" && (
        <Link href="/driver" className="text-gray-800 hover:text-blue-600 py-2 md:py-0">
          Haydovchi paneli
        </Link>
      )}
      {user ? (
        <Link href="/profile" className="text-gray-800 hover:text-blue-600 py-2 md:py-0">
          Profil
        </Link>
      ) : (
        <>
          <Link href="/login" className="text-gray-800 hover:text-blue-600 py-2 md:py-0">
            Kirish
          </Link>
          <Link href="/register" className="text-gray-800 hover:text-blue-600 py-2 md:py-0">
            Ro'yxatdan o'tish
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="bg-white shadow sticky top-0 z-20">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
        <Link href="/" className="text-lg sm:text-xl font-bold text-blue-700 shrink-0">
          🚕 YoʻlYoʻldosh
        </Link>

        {/* Kompyuter/planshet: to'liq gorizontal menyu */}
        <div className="hidden md:flex gap-5 text-sm items-center">
          {links}
          {user && <NotificationBell unread={unread} />}
        </div>

        {/* Mobil: bildirishnoma + hamburger tugma */}
        <div className="flex md:hidden items-center gap-3">
          {user && <NotificationBell unread={unread} />}
          <button
            aria-label="Menyu"
            onClick={() => setMenuOpen((v) => !v)}
            className="text-2xl leading-none px-1 text-gray-700"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobil ochiladigan menyu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 pb-3 flex flex-col text-sm bg-white">{links}</div>
      )}
    </nav>
  );
}

function NotificationBell({ unread }: { unread: number }) {
  return (
    <Link href="/notifications" className="relative text-gray-800 hover:text-blue-600 text-lg">
      🔔
      {unread > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
