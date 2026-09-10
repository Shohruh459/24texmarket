import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import Navbar from '../components/Navbar'
import { initTelegramWebApp } from '../lib/telegram'
import { AuthProvider } from '../lib/useUser'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onLoad={initTelegramWebApp}
      />
      <Navbar />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
