import QRCode from "qrcode";

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 280,
    color: { dark: "#1e3a8a", light: "#ffffff" },
  });
}

export function getBaseUrl(req?: { headers: { host?: string; [k: string]: any } }): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (typeof window !== "undefined") return window.location.origin;
  const host = req?.headers.host || "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export function driverSubscribeUrl(qrCodeId: string, req?: { headers: { host?: string } }): string {
  return `${getBaseUrl(req)}/driver/${qrCodeId}`;
}
