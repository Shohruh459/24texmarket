import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import Navbar from '../components/Navbar'
import { initTelegramWebApp } from '../lib/telegram'
import { AuthProvider } from '../lib/useUser'
import { ToastProvider } from '../components/ui/Toast'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Head>
          {/* Mobil (iPhone/Android) va Telegram Mini App oynasida to'g'ri masshtablanishi uchun */}
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <title>YoʻlYoʻldosh — Viloyatlararo taksi</title>
          <meta name="description" content="Viloyatlararo qulay taksi va yo'l-yo'lakay: haydovchi va yo'lovchilarni bog'laydigan platforma." />
        </Head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
          onLoad={initTelegramWebApp}
        />
        <Navbar />
        <main className="min-h-[calc(100vh-57px)] animate-fade-in">
          <Component {...pageProps} />
        </main>
      </ToastProvider>
    </AuthProvider>
  );
}
