// Telegram Mini App muhitida ishga tushirilganda ilovani Telegram klientiga moslaydi.
// Oddiy brauzerda ochilganda (window.Telegram mavjud bo'lmaganda) hech narsa qilmaydi.

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        themeParams?: Record<string, string>;
      };
    };
  }
}

export function initTelegramWebApp() {
  if (typeof window === "undefined") return;
  const webApp = window.Telegram?.WebApp;
  if (!webApp) return;

  try {
    webApp.ready();
    webApp.expand();
    webApp.setHeaderColor?.("#ffffff");
    webApp.setBackgroundColor?.("#f9fafb");
  } catch {
    // Telegram SDK versiyasiga bog'liq metodlar yo'q bo'lsa, jim o'tkazib yuboramiz
  }
}
