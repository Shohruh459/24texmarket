import { useState } from "react";
import { useRouter } from "next/router";
import { apiFetch } from "../lib/api";

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await apiFetch<{ role: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      });
      const next = typeof router.query.next === "string" ? router.query.next : null;
      router.push(next || (user.role === "DRIVER" ? "/driver" : "/search"));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Kirish</h1>
      <form onSubmit={handleLogin} className="space-y-4">
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
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "Yuklanmoqda..." : "Kirish"}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
      <p className="text-sm text-gray-500 mt-4 text-center">
        Akkauntingiz yo‘qmi?{" "}
        <a href="/register" className="text-blue-600 underline">
          Ro‘yxatdan o‘tish
        </a>
      </p>
    </div>
  );
}
