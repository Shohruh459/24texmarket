import Link from "next/link";
import PageHead from "../components/ui/PageHead";

export default function NotFoundPage() {
  return (
    <>
      <PageHead title="Sahifa topilmadi" />
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🧭</div>
        <h1 className="text-2xl font-bold text-ink">Sahifa topilmadi</h1>
        <p className="text-ink-muted mt-2">
          Siz izlagan sahifa mavjud emas yoki havola noto'g'ri.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/" className="btn-primary">Bosh sahifa</Link>
          <Link href="/search" className="btn-secondary">Qatnov qidirish</Link>
        </div>
      </div>
    </>
  );
}
