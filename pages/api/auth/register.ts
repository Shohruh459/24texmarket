import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { signToken, setSessionCookie } from "../../../lib/auth";
import { checkRateLimit, getClientIp } from "../../../lib/rateLimit";

const PHONE_REGEX = /^\+?[0-9]{9,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rateKey = `register:${getClientIp(req)}`;
  if (!checkRateLimit(rateKey, 10, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring." });
  }

  const { fullName, phone, email, password, role } = req.body || {};

  if (
    !fullName ||
    !phone ||
    !password ||
    typeof fullName !== "string" ||
    typeof phone !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ error: "Ism, telefon va parol majburiy" });
  }
  if (fullName.trim().length < 2 || fullName.length > 100) {
    return res.status(400).json({ error: "Ism-familiya 2-100 belgi oralig'ida bo'lishi kerak" });
  }
  if (!PHONE_REGEX.test(phone.trim())) {
    return res.status(400).json({ error: "Telefon raqam formati noto'g'ri (masalan: +998901234567)" });
  }
  if (email && (typeof email !== "string" || !EMAIL_REGEX.test(email))) {
    return res.status(400).json({ error: "Email formati noto'g'ri" });
  }
  if (password.length < 6 || password.length > 100) {
    return res.status(400).json({ error: "Parol kamida 6 belgidan iborat bo'lishi kerak" });
  }
  const userRole = role === "DRIVER" ? "DRIVER" : "PASSENGER";
  const normalizedPhone = phone.trim();
  const normalizedName = fullName.trim();

  const existing = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
  if (existing) {
    return res.status(409).json({ error: "Bu telefon raqami bilan foydalanuvchi mavjud" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName: normalizedName,
      phone: normalizedPhone,
      email: email ? email.trim() : undefined,
      passwordHash,
      role: userRole,
    },
  });

  const token = signToken({ userId: user.id, role: user.role });
  setSessionCookie(res, token);

  return res.status(201).json({
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
  });
}
