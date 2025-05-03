import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/router";

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  region: string;
  imageUrl?: string;
}

export default function ProfilePage() {
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    setUserEmail(currentUser.email);

    const fetchUserListings = async () => {
      const q = query(collection(db, "listings"), where("owner", "==", currentUser.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Listing[];
      setUserListings(data);
    };

    fetchUserListings();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("E’lonni o‘chirishni xohlaysizmi?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "listings", id));
    setUserListings((prev) => prev.filter((listing) => listing.id !== id));
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profil</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-3 py-1 rounded"
        >
          Chiqish
        </button>
      </div>

      <p className="mb-4 text-gray-700">Email: {userEmail}</p>

      {userListings.length === 0 ? (
        <p>Sizda hali e’lon mavjud emas.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userListings.map((listing) => (
            <div key={listing.id} className="bg-white p-4 shadow rounded">
              {listing.imageUrl && (
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <h2 className="text-lg font-semibold">{listing.title}</h2>
              <p>Narx: {listing.price.toLocaleString()} so‘m</p>
              <p>Kategoriya: {listing.category} | Hudud: {listing.region}</p>
              <div className="flex gap-3 mt-2">
              <Link href={`/edit/${listing.id}`}>
  <button className="text-blue-600 underline text-sm">Tahrirlash</button>
</Link>

                <button
                  onClick={() => handleDelete(listing.id)}
                  className="text-red-600 underline text-sm"
                >
                  O‘chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
