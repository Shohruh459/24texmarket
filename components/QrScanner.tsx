import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

interface QrScannerProps {
  onResult: (text: string) => void;
}

export default function QrScanner({ onResult }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState(false);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  };

  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
      requestAnimationFrame(tick);
    } catch (err) {
      setError("Kameraga ruxsat berilmadi. Havolani qo'lda kiriting.");
    }
  };

  const tick = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          onResult(code.data);
          stopCamera();
          return;
        }
      }
    }
    requestAnimationFrame(tick);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full max-w-sm aspect-square bg-black rounded-xl overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
            Kamera o'chirilgan
          </div>
        )}
      </div>
      {!active ? (
        <button onClick={startCamera} className="bg-blue-600 text-white px-4 py-2 rounded">
          📷 QR skanerni yoqish
        </button>
      ) : (
        <button onClick={stopCamera} className="bg-gray-600 text-white px-4 py-2 rounded">
          To'xtatish
        </button>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
