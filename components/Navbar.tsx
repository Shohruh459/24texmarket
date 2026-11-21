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
      // Oyna fonda (boshqa tab/yashirin) bo'lsa bazaga tegmaymiz.
      // Bu bepul limitni tejaydi va keraksiz o'qishlar 24/7
      // to'planib ketishining oldini oladi.
      if (typeof document !== "undefined" && document.hidden) return;
      apiFetch<{ unreadCount: number }>("/api/notifications?countOnly=1")
        .then((d) => setUnread(d.unreadCount))
        .catch(() => {});
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);

    const onVisible = () => {
      if (!document.hidden) fetchUnread();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user]);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  const isActive = (href: string) =>
    href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

  const navLink = (href: string, label: string) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          active ? "text-brand-700 bg-brand-50" : "text-ink-soft hover:text-brand-700 hover:bg-surface-sunken"
        }`}
      >
        {label}
      </Link>
    );
  };

  const links = (
    <>
      {navLink("/search", "Qatnov qidirish")}
      {navLink("/scan", "QR skanerlash")}
      {user?.role === "DRIVER" && navLink("/driver", "Haydovchi paneli")}
      {user ? (
        navLink("/profile", "Profil")
      ) : (
        <>
          {navLink("/login", "Kirish")}
          <Link href="/register" className="btn-primary !py-2">
            Ro'yxatdan o'tish
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-header sticky top-0 z-20 border-b border-slate-100">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-2.5">
        <Link href="/" className="flex items-center gap-1.5 text-lg sm:text-xl font-bold text-brand-700 shrink-0">
          <span>🚕</span>
          <span>YoʻlYoʻldosh</span>
        </Link>

        <div className="hidden md:flex gap-1 items-center">
          {links}
          {user && <NotificationBell unread={unread} />}
        </div>

        <div className="flex md:hidden items-center gap-1">
          {user && <NotificationBell unread={unread} />}
          <button
            aria-label="Menyu"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-xl text-ink-soft hover:bg-surface-sunken"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 px-3 py-2 flex flex-col gap-1 bg-white animate-slide-up">
          {links}
        </div>
      )}
    </nav>
  );
}

function NotificationBell({ unread }: { unread: number }) {
  return (
    <Link
      href="/notifications"
      aria-label="Bildirishnomalar"
      className="relative w-10 h-10 flex items-center justify-center rounded-lg text-xl hover:bg-surface-sunken"
    >
      🔔
      {unread > 0 && (
        <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
