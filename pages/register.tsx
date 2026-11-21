import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { apiFetch } from "../lib/api";
import { useUser } from "../lib/useUser";
import { useToast } from "../components/ui/Toast";
import PageHead from "../components/ui/PageHead";
import Spinner from "../components/ui/Spinner";

export default function Register() {
  const router = useRouter();
  const { refresh } = useUser();
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PASSENGER" | "DRIVER">("PASSENGER");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, phone, password, role }),
      });
      await refresh();
      toast.success("Akkaunt yaratildi!");
      router.push(role === "DRIVER" ? "/driver" : "/search");
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <PageHead title="Ro'yxatdan o'tish" />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="card-pad animate-slide-up">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🚀</div>
            <h1 className="text-2xl font-bold text-ink">Akkaunt yarating</h1>
            <p className="text-sm text-ink-muted mt-1">Bir daqiqada ro'yxatdan o'ting</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Rol tanlash — katta, aniq kartalar */}
            <div>
              <span className="label">Kim sifatida qo'shilasiz?</span>
              <div className="grid grid-cols-2 gap-3">
                <RoleCard
                  active={role === "PASSENGER"}
                  onClick={() => setRole("PASSENGER")}
                  icon="🧳"
                  label="Yo'lovchiman"
                />
                <RoleCard
                  active={role === "DRIVER"}
                  onClick={() => setRole("DRIVER")}
                  icon="🚗"
                  label="Haydovchiman"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="fullName">Ism familiya</label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Alisher Karimov"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
                required
              />
            </div>
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
                autoComplete="new-password"
                placeholder="Kamida 6 ta belgi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-success btn-block btn-lg">
              {loading ? <Spinner className="w-5 h-5" /> : "Ro'yxatdan o'tish"}
            </button>
          </form>

          <p className="text-sm text-ink-muted mt-6 text-center">
            Akkauntingiz bormi?{" "}
            <Link href="/login" className="text-brand-600 font-medium hover:underline">
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

function RoleCard({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-4 transition-all ${
        active
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-slate-200 text-ink-muted hover:border-slate-300"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
