import { useEffect, useState } from "react";
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

export function useUser() {
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

  return { user, loading, refresh, setUser };
}
