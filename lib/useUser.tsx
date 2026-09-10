import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch } from "./api";

export interface DriverInfo {
  id: string;
  carModel: string;
  carPlate: string;
  carColor: string | null;
  totalSeats: number;
  seatLayout: string[] | null;
  defaultFrom: string | null;
  defaultTo: string | null;
  defaultPrice: number | null;
  qrCodeId: string;
}

export interface CurrentUser {
  id: string;
  fullName: string;
  phone: string;
  role: "PASSENGER" | "DRIVER" | "ADMIN";
  driver: DriverInfo | null;
}

interface AuthState {
  user: CurrentUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (user: CurrentUser | null) => void;
}

const AuthContext = createContext<AuthState | null>(null);

// Butun ilova uchun BITTA umumiy autentifikatsiya holati — shunda login/logout
// amalga oshirilganda Navbar va boshqa barcha komponentlar darhol yangilanadi
// (sahifa qayta yuklanishini kutmasdan, chunki client-side navigatsiyada
// _app.tsx ichidagi Navbar qayta mount bo'lmaydi).
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await apiFetch<CurrentUser>("/api/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return <AuthContext.Provider value={{ user, loading, refresh, setUser }}>{children}</AuthContext.Provider>;
}

export function useUser(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useUser AuthProvider ichida ishlatilishi kerak");
  }
  return ctx;
}
