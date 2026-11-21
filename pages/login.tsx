import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { apiFetch } from "../lib/api";
import { useUser } from "../lib/useUser";
import { useToast } from "../components/ui/Toast";
import PageHead from "../components/ui/PageHead";
import Spinner from "../components/ui/Spinner";

export default function Login() {
  const router = useRouter();
  const { refresh } = useUser();
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await apiFetch<{ role: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      });
      await refresh();
      toast.success("Xush kelibsiz!");
      const next = typeof router.query.next === "string" ? router.query.next : null;
      router.push(next || (user.role === "DRIVER" ? "/driver" : "/search"));
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <PageHead title="Kirish" />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="card-pad animate-slide-up">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">👋</div>
            <h1 className="text-2xl font-bold text-ink">Xush kelibsiz</h1>
            <p className="text-sm text-ink-muted mt-1">Hisobingizga kiring</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label" htmlFor="phone">Telefon raqam</label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Parol</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary btn-block btn-lg">
              {loading ? <Spinner className="w-5 h-5" /> : "Kirish"}
            </button>
          </form>

          <p className="text-sm text-ink-muted mt-6 text-center">
            Akkauntingiz yo'qmi?{" "}
            <Link href="/register" className="text-brand-600 font-medium hover:underline">
              Ro'yxatdan o'tish
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
