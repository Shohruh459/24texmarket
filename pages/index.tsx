import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <section className="text-center mb-12 mt-6">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-3">
          Viloyatlararo Qulay Taksi va Yo'l-yo'lakay
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Shaharlararo qatnovchi haydovchilar va arzon yo'l haqi izlayotgan yo'lovchilarni bir joyda
          bog'laydi. Doimiy yo'nalishingiz bo'yicha bir tugma bosish orqali e'lon joylang yoki bo'sh
          o'rindiqni oldindan tanlab bron qiling.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <Link href="/search" className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold">
            🔍 Qatnov qidirish
          </Link>
          <Link href="/register" className="bg-white border border-blue-600 text-blue-600 px-5 py-3 rounded-xl font-semibold">
            🚗 Haydovchi bo'lib ro'yxatdan o'tish
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: "📝",
            title: "Profilni to'ldiring",
            desc: "Haydovchilar moshina va doimiy yo'nalishni bir marta kiritadi.",
          },
          {
            icon: "🚦",
            title: "Qatnov e'lon qiling yoki toping",
            desc: "Bir tugma bilan e'lon joylang yoki filtr orqali kerakli yo'nalishni qidiring.",
          },
          {
            icon: "🔔",
            title: "Xabardor bo'lib boring",
            desc: "Haydovchi yo'lga chiqqanda barcha obunachi va bron qilganlarga avtomatik xabar boradi.",
          },
        ].map((item) => (
          <div key={item.title} className="bg-white shadow rounded-xl p-5 text-center">
            <div className="text-4xl mb-2">{item.icon}</div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">🚗 Haydovchilar uchun</h2>
          <ul className="text-gray-600 space-y-1 text-sm list-disc list-inside">
            <li>Interaktiv o'rindiqlar maketi orqali bo'sh joylarni boshqaring</li>
            <li>Shaxsiy QR-kod orqali doimiy yo'lovchilarni to'plang</li>
            <li>"Yo'lga chiqdim" tugmasi bilan hammaga bir zumda xabar bering</li>
          </ul>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">🧳 Yo'lovchilar uchun</h2>
          <ul className="text-gray-600 space-y-1 text-sm list-disc list-inside">
            <li>Yo'nalish, vaqt va narx bo'yicha qidiring</li>
            <li>Avtomobil maketidan o'zingiz xohlagan o'rindiqni tanlang</li>
            <li>Xaritadan olib ketish nuqtangizni belgilang</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
