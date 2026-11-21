import { useState } from "react";
import { useRouter } from "next/router";
import QrScanner from "../components/QrScanner";
import PageHead from "../components/ui/PageHead";
import { useToast } from "../components/ui/Toast";

export default function ScanPage() {
  const router = useRouter();
  const toast = useToast();
  const [manualLink, setManualLink] = useState("");

  const goToLink = (text: string) => {
    try {
      const url = new URL(text);
      router.push(url.pathname);
    } catch {
      toast.error("QR-kod noto'g'ri havolani o'z ichiga oladi");
    }
  };

  return (
    <>
      <PageHead title="QR skanerlash" />
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="card-pad text-center">
          <div className="text-4xl mb-2">📷</div>
          <h1 className="text-xl font-bold text-ink mb-1">Haydovchiga obuna bo'lish</h1>
          <p className="text-ink-muted text-sm mb-5">Haydovchining shaxsiy QR-kodini skanerlang</p>

          <QrScanner onResult={goToLink} />

          <div className="mt-6 text-left">
            <label className="label">Yoki havolani qo'lda kiriting</label>
            <div className="flex gap-2">
              <input
                value={manualLink}
                onChange={(e) => setManualLink(e.target.value)}
                placeholder="https://.../driver/..."
                className="input flex-1 text-sm"
              />
              <button onClick={() => goToLink(manualLink)} className="btn-primary !px-4 whitespace-nowrap">
                O'tish
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
