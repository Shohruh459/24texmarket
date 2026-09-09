import { useState } from "react";
import { useRouter } from "next/router";
import QrScanner from "../components/QrScanner";

export default function ScanPage() {
  const router = useRouter();
  const [manualLink, setManualLink] = useState("");
  const [error, setError] = useState("");

  const goToLink = (text: string) => {
    try {
      const url = new URL(text);
      router.push(url.pathname);
    } catch {
      setError("QR-kod noto'g'ri havolani o'z ichiga oladi");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow text-center">
      <h1 className="text-xl font-bold mb-2">Haydovchiga obuna bo'lish</h1>
      <p className="text-gray-600 mb-4">Haydovchining shaxsiy QR-kodini skanerlang.</p>

      <QrScanner onResult={goToLink} />

      <div className="mt-6 text-left">
        <p className="text-sm text-gray-500 mb-1">Yoki havolani qo'lda kiriting:</p>
        <div className="flex gap-2">
          <input
            value={manualLink}
            onChange={(e) => setManualLink(e.target.value)}
            placeholder="https://.../driver/..."
            className="flex-1 p-2 border rounded text-sm"
          />
          <button onClick={() => goToLink(manualLink)} className="bg-blue-600 text-white px-3 py-2 rounded text-sm">
            O'tish
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
