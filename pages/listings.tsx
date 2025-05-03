import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { heavyTypes } from "../data/categories";
import { regions } from "../data/regions";

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  region: string;
  district: string;
  imageUrl?: string;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filtered, setFiltered] = useState<Listing[]>([]);

  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "listings"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Listing[];
      setListings(data);
      setFiltered(data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filteredData = [...listings];

    if (category) filteredData = filteredData.filter((l) => l.category === category);
    if (region) filteredData = filteredData.filter((l) => l.region === region);
    if (district) filteredData = filteredData.filter((l) => l.district === district);
    if (minPrice) filteredData = filteredData.filter((l) => l.price >= parseInt(minPrice));
    if (maxPrice) filteredData = filteredData.filter((l) => l.price <= parseInt(maxPrice));
    if (search) filteredData = filteredData.filter((l) =>
      l.title.toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(filteredData);
  }, [category, type, region, district, minPrice, maxPrice, search, listings]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">E’lonlar</h1>

      {/* Filter Form */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border rounded">
          <option value="">Kategoriya</option>
          <option value="yengil">Yengil avtomobil</option>
          <option value="yirik">Yirik texnika</option>
        </select>

        {category === "yirik" && (
          <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 border rounded">
            <option value="">Texnika turi</option>
            {heavyTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}

        <select value={region} onChange={(e) => { setRegion(e.target.value); setDistrict(""); }} className="p-2 border rounded">
          <option value="">Viloyat</option>
          {Object.keys(regions).map((reg) => (
            <option key={reg} value={reg}>{reg}</option>
          ))}
        </select>

        {region && (
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className="p-2 border rounded">
            <option value="">Tuman</option>
            {regions[region].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}

        <input
          type="number"
          placeholder="Min narx"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="p-2 border rounded"
        />

        <input
          type="number"
          placeholder="Max narx"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      {/* Qidiruv */}
      <input
        type="text"
        placeholder="Qidiruv..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full p-2 border rounded"
      />

      {/* E’lonlar ro‘yxati */}
      {filtered.length === 0 ? (
        <p>Mos e’lon topilmadi.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => (
            <div key={listing.id} className="bg-white p-4 rounded shadow">
              {listing.imageUrl && (
                <img src={listing.imageUrl} alt={listing.title} className="w-full h-48 object-cover rounded mb-2" />
              )}
              <h2 className="text-lg font-bold">{listing.title}</h2>
              <p className="text-gray-600">
                Narx: {listing.price.toLocaleString()} so‘m
                {listing.category === "yirik" ? " / soat" : ""}
              </p>
              <p className="text-sm text-gray-500">{listing.region}, {listing.district}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
