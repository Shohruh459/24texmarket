import Link from "next/link";
import PageHead from "../components/ui/PageHead";
import { useUser } from "../lib/useUser";

export default function Home() {
  const { user } = useUser();

  return (
    <>
      <PageHead
        title="Bosh sahifa"
        description="Viloyatlararo qulay taksi va yo'l-yo'lakay — haydovchi va yo'lovchilarni bog'laydigan platforma."
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-surface-page">
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-14 text-center">
          <span className="badge bg-brand-100 text-brand-700 mb-4">🚕 Viloyatlararo qatnov</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-ink leading-tight">
            Qulay taksi va{" "}
            <span className="text-brand-600">yo'l-yo'lakay</span> hamrohingiz
          </h1>
          <p className="text-ink-muted max-w-2xl mx-auto mt-4 text-base sm:text-lg">
            Shaharlararo haydovchilar va arzon yo'l izlayotgan yo'lovchilarni bir joyda bog'laymiz.
            Bir tugma bilan qatnov e'lon qiling yoki bo'sh o'rindiqni oldindan tanlab bron qiling.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-7">
            <Link href="/search" className="btn-primary btn-lg">
              🔍 Qatnov qidirish
            </Link>
            {!user && (
              <Link href="/register" className="btn-secondary btn-lg">
                🚗 Haydovchi bo'lib ulanish
              </Link>
            )}
            {user?.role === "DRIVER" && (
              <Link href="/driver" className="btn-secondary btn-lg">
                🚗 Haydovchi paneli
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* 3 qadam */}
        <section>
          <h2 className="text-center text-2xl font-bold text-ink mb-8">Qanday ishlaydi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: "📝", title: "Profilni to'ldiring", desc: "Haydovchilar moshina va doimiy yo'nalishni bir marta kiritadi." },
              { icon: "🚦", title: "E'lon qiling yoki toping", desc: "Bir tugma bilan e'lon joylang yoki filtr orqali kerakli yo'nalishni qidiring." },
              { icon: "🔔", title: "Xabardor bo'ling", desc: "Haydovchi yo'lga chiqqanda barcha obunachi va bron qilganlarga avtomatik xabar boradi." },
            ].map((item, i) => (
              <div key={item.title} className="card-pad text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center shadow-sm">
                  {i + 1}
                </div>
                <div className="text-4xl mb-3 mt-2">{item.icon}</div>
                <h3 className="font-semibold text-ink">{item.title}</h3>
                <p className="text-ink-muted text-sm mt-1.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ikki auditoriya */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card-pad border-t-4 border-brand-500">
            <h3 className="section-title flex items-center gap-2 mb-3">🚗 Haydovchilar uchun</h3>
            <ul className="space-y-2.5 text-sm text-ink-soft">
              <FeatureItem>Interaktiv o'rindiqlar maketi orqali bo'sh joylarni boshqaring</FeatureItem>
              <FeatureItem>Shaxsiy QR-kod orqali doimiy yo'lovchilarni to'plang</FeatureItem>
              <FeatureItem>"Yo'lga chiqdim" tugmasi bilan hammaga bir zumda xabar bering</FeatureItem>
            </ul>
          </div>
          <div className="card-pad border-t-4 border-emerald-500">
            <h3 className="section-title flex items-center gap-2 mb-3">🧳 Yo'lovchilar uchun</h3>
            <ul className="space-y-2.5 text-sm text-ink-soft">
              <FeatureItem>Yo'nalish, vaqt va narx bo'yicha qidiring</FeatureItem>
              <FeatureItem>Avtomobil maketidan o'zingiz xohlagan o'rindiqni tanlang</FeatureItem>
              <FeatureItem>Xaritadan olib ketish nuqtangizni belgilang</FeatureItem>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}
