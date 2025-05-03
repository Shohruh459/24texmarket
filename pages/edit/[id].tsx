import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { heavyTypes } from "../../data/categories";
import { regions } from "../../data/regions";

export default function EditListingPage() {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "",
    region: "",
    district: "",
    imageUrl: ""
  });

  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        const docRef = doc(db, "listings", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            title: data.title || "",
            price: data.price?.toString() || "",
            category: data.category || "",
            region: data.region || "",
            district: data.district || "",
            imageUrl: data.imageUrl || ""
          });
        } else {
          alert("E’lon topilmadi");
          router.push("/profile");
        }
      };
      fetchData();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docRef = doc(db, "listings", id as string);
      let imageUrl = form.imageUrl;

      if (image) {
        const imgRef = ref(storage, `images/${Date.now()}_${image.name}`);
        await uploadBytes(imgRef, image);
        imageUrl = await getDownloadURL(imgRef);
      }

      await updateDoc(docRef, {
        ...form,
        price: Number(form.price),
        imageUrl
      });

      router.push("/profile");
    } catch (err) {
      console.error("Xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">E’lonni tahrirlash</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Sarlavha"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Narx"
          className="w-full p-2 border rounded"
          required
        />
        {form.category === "yirik" && (
          <p className="text-sm text-gray-500 ml-1">Narx: so‘m / soat</p>
        )}

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Kategoriya tanlang</option>
          <option value="yengil">Yengil avtomobil</option>
          <option value="yirik">Yirik texnika</option>
        </select>

        {form.category === "yirik" && (
          <select className="w-full p-2 border rounded">
            <option value="">Texnika turi</option>
            {heavyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        )}

        <select
          name="region"
          value={form.region}
          onChange={(e) => {
            handleChange(e);
            setForm((prev) => ({ ...prev, district: "" }));
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

        {form.region && (
          <select
            name="district"
            value={form.district}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Tuman tanlang</option>
            {regions[form.region].map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        )}

        <label className="block text-sm font-medium text-gray-700">
          Yangi rasm yuklash (ixtiyoriy):
        </label>
        <input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} accept="image/*" />

        {form.imageUrl && (
          <img src={form.imageUrl} alt="Eski rasm" className="w-full h-40 object-cover rounded" />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {loading ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
    </div>
  );
}
