import { useState } from "react";
import { useRouter } from "next/router";
import { apiFetch } from "../lib/api";
import { useUser } from "../lib/useUser";

export default function Register() {
  const router = useRouter();
  const { refresh } = useUser();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PASSENGER" | "DRIVER">("PASSENGER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, phone, password, role }),
      });
      await refresh(); // Navbar va boshqa komponentlarda ham yangi sessiyani darhol aks ettirish
      router.push(role === "DRIVER" ? "/driver" : "/search");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Ro‘yxatdan o‘tish</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Ism familiya"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="tel"
          placeholder="Telefon raqam (+998...)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setRole("PASSENGER")}
            className={`flex-1 p-2 rounded border ${
              role === "PASSENGER" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300"
            }`}
          >
            Yo‘lovchiman
          </button>
          <button
            type="button"
            onClick={() => setRole("DRIVER")}
            className={`flex-1 p-2 rounded border ${
              role === "DRIVER" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300"
            }`}
          >
            Haydovchiman
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "Yuklanmoqda..." : "Ro‘yxatdan o‘tish"}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
      <p className="text-sm text-gray-500 mt-4 text-center">
        Akkauntingiz bormi?{" "}
        <a href="/login" className="text-blue-600 underline">
          Kirish
        </a>
      </p>
    </div>
  );
}
