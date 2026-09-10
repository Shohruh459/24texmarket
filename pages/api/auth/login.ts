import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { signToken, setSessionCookie } from "../../../lib/auth";
import { checkRateLimit, getClientIp } from "../../../lib/rateLimit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone, password } = req.body || {};
  if (!phone || !password || typeof phone !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Telefon va parol majburiy" });
  }

  // Brute-force urinishlarga qarshi: bir IP + telefon kombinatsiyasi uchun
  // 15 daqiqada ko'pi bilan 10 ta urinishga ruxsat beriladi.
  const rateKey = `login:${getClientIp(req)}:${phone}`;
  if (!checkRateLimit(rateKey, 10, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring." });
  }

  const user = await prisma.user.findUnique({ where: { phone: phone.trim() } });
  if (!user) {
    return res.status(401).json({ error: "Telefon yoki parol noto'g'ri" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Telefon yoki parol noto'g'ri" });
  }

  const token = signToken({ userId: user.id, role: user.role });
  setSessionCookie(res, token);

  return res.status(200).json({
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
  });
}
