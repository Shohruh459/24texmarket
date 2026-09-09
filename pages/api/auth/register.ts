import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { signToken, setSessionCookie } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fullName, phone, email, password, role } = req.body || {};

  if (!fullName || !phone || !password) {
    return res.status(400).json({ error: "Ism, telefon va parol majburiy" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Parol kamida 6 belgidan iborat bo'lishi kerak" });
  }
  const userRole = role === "DRIVER" ? "DRIVER" : "PASSENGER";

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return res.status(409).json({ error: "Bu telefon raqami bilan foydalanuvchi mavjud" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      phone,
      email: email || undefined,
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
