import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/auth";
import { notifyBookingCancelled } from "../../../lib/notify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res);
  if (!user) return;

  const { id } = req.query;

  if (req.method === "DELETE") {
    const booking = await prisma.booking.findUnique({
      where: { id: String(id) },
      include: { trip: { include: { driver: true } } },
    });

    if (!booking) return res.status(404).json({ error: "Bron topilmadi" });

    // Faqat bronni yaratgan yo'lovchining o'zi uni bekor qila oladi —
    // boshqa foydalanuvchining bronini bekor qilishga yo'l qo'yilmaydi.
    if (booking.passengerId !== user.id) {
      return res.status(403).json({ error: "Sizga bu bronni bekor qilishga ruxsat yo'q" });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ error: "Bron allaqachon bekor qilingan" });
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });

    // Agar qatnov "to'ldi" bo'lgan bo'lsa, bo'shagan joy tufayli uni qaytadan
    // "e'lon qilingan" holatiga o'tkazamiz (albatta hali yo'lga chiqmagan bo'lsa).
    if (booking.trip.status === "FULL") {
      await prisma.trip.update({
        where: { id: booking.trip.id },
        data: { status: "SCHEDULED" },
      });
    }

    await notifyBookingCancelled(booking.trip.driver.userId, booking.trip, booking.seatNumber, user.fullName);

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
