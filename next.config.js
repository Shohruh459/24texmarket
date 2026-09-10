/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  // MIME-sniffing orqali kontent turi soxtalashtirilishining oldini oladi.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Boshqa saytlarga o'tishda to'liq URL (masalan, ichidagi token/parametrlarni) oshkor qilmaydi.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Ilova faqat QR-skaner uchun kamera ruxsatiga muhtoj — boshqa hammasi taqiqlanadi.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
  // MUHIM: X-Frame-Options / frame-ancestors ataylab qo'yilmagan — bu ilova
  // Telegram Mini App sifatida Telegram web/desktop klientining iframe'i ichida
  // ishlashi kerak. Qattiq frame-bloklash Telegram'da ilovani butunlay ishdan chiqaradi.
];

if (isProd) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
