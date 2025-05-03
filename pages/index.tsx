import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  region: string;
  imageUrl?: string;
}

export default function Home() {
  const [latest, setLatest] = useState<Listing[]>([]);

  useEffect(() => {
    const fetchLatest = async () => {
      const q = query(collection(db, "listings"), orderBy("createdAt", "desc"), limit(6));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Listing[];
      setLatest(data);
    };

    fetchLatest();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Sayt haqida */}
      <section className="text-center mb-10">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">24TexMarket</h1>
        <p className="text-gray-600">
          O‘zbekiston bo‘ylab <span className="font-semibold">yirik texnika</span> va <span className="font-semibold">yengil transport vositalarini</span> ijaraga berish va topish platformasi.
        </p>
      </section>

      {/* Qanday ishlaydi */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { step: "1", title: "Ro‘yxatdan o‘ting", desc: "Email yoki Google orqali akkaunt yarating." },
          { step: "2", title: "E’lon joylang", desc: "Texnikangiz yoki avtomobilingizni ko‘rsating." },
          { step: "3", title: "Toping va aloqa qiling", desc: "Sifatli mijozlarga tez yetishing." },
        ].map((item) => (
          <div key={item.step} className="bg-white shadow rounded p-4 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{item.step}</div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-gray-500">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Oxirgi e’lonlar */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">So‘nggi e’lonlar</h2>
          <Link href="/listings" className="text-blue-600 hover:underline text-sm">Barchasini ko‘rish →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {latest.map((listing) => (
            <div key={listing.id} className="bg-white p-4 rounded shadow">
              {listing.imageUrl && (
                <img src={listing.imageUrl} alt={listing.title} className="w-full h-40 object-cover rounded mb-2" />
              )}
              <h3 className="text-lg font-bold">{listing.title}</h3>
              <p className="text-gray-600">
                Narx: {listing.price.toLocaleString()} so‘m {listing.category === "yirik" ? " / soat" : ""}
              </p>
              <p className="text-sm text-gray-500">{listing.region}</p>
              <Link href={`/edit/${listing.id}`} className="text-blue-500 text-sm underline mt-2 inline-block">
                Batafsil →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
