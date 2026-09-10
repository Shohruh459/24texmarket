import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="uz">
      <Head>
        <meta charSet="utf-8" />
        {/* Mobil (iPhone/Android) va Telegram Mini App oynasida to'g'ri masshtablanishi uchun */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#1d4ed8" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
