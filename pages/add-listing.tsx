import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db, storage } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { regions } from "../data/regions";
import { heavyTypes } from "../data/categories";

export default function AddListing() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [subtypes, setSubtypes] = useState<string[]>([]);

  useEffect(() => {
    if (category === "yirik") {
      setSubtypes(heavyTypes);
    } else {
      setSubtypes([]);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("Avval tizimga kiring");
      return;
    }

    try {
      const listingData: any = {
        title,
        price: Number(price),
        category,
        region,
        district,
        owner: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      };

      // Rasm yuklash
      if (image) {
        const imageRef = ref(storage, `images/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        listingData.imageUrl = await getDownloadURL(imageRef);
      }

      // Sertifikat yuklash
      if (certificate) {
        const certRef = ref(storage, `certificates/${Date.now()}_${certificate.name}`);
        await uploadBytes(certRef, certificate);
        listingData.certificateUrl = await getDownloadURL(certRef);
      }

      await addDoc(collection(db, "listings"), listingData);
      router.push("/profile");
    } catch (err) {
      console.error("Xatolik:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">E’lon qo‘shish</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Sarlavha"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          placeholder="Narx"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        {category === "yirik" && (
          <p className="text-sm text-gray-500 ml-1">Narx: so‘m / soat</p>
        )}

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Kategoriya tanlang</option>
          <option value="yengil">Yengil avtomobil</option>
          <option value="yirik">Yirik texnika</option>
        </select>

        {category === "yirik" && (
          <select className="w-full p-2 border rounded">
            <option value="">Texnika turi tanlang</option>
            {subtypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        )}

        <select
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
            setDistrict(""); // reset district
          }}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Viloyat tanlang</option>
          {Object.keys(regions).map((reg) => (
            <option key={reg} value={reg}>
              {reg}
            </option>
          ))}
        </select>

        {region && (
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Tuman tanlang</option>
            {regions[region].map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        )}

        <label className="block text-sm font-medium text-gray-700">
          Rasm yuklang:
        </label>
        <input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} accept="image/*" />

        <label className="block text-sm font-medium text-gray-700">
          Taksi huquqiga oid sertifikat yuklang:
        </label>
        <input type="file" onChange={(e) => setCertificate(e.target.files?.[0] || null)} accept=".pdf,.jpg,.png" />

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          E’lonni joylash
        </button>
      </form>
    </div>
  );
}
