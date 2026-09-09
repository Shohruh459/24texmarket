import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { requireUser } from "../../lib/auth";
import { notifyBookingConfirmed } from "../../lib/notify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === "GET") {
    const bookings = await prisma.booking.findMany({
      where: { passengerId: user.id, status: { not: "CANCELLED" } },
      include: { trip: true },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(bookings);
  }

  if (req.method === "POST") {
    const { tripId, seatNumber, pickupLat, pickupLng, pickupNote } = req.body || {};
    if (!tripId || !seatNumber) {
      return res.status(400).json({ error: "Qatnov va o'rindiq tanlanishi kerak" });
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) return res.status(404).json({ error: "Qatnov topilmadi" });
    if (trip.status !== "SCHEDULED") {
      return res.status(400).json({ error: "Bu qatnov uchun bron qilib bo'lmaydi" });
    }

    try {
      const booking = await prisma.booking.create({
        data: {
          tripId,
          passengerId: user.id,
          seatNumber,
          pickupLat: pickupLat != null ? Number(pickupLat) : null,
          pickupLng: pickupLng != null ? Number(pickupLng) : null,
          pickupNote: pickupNote || null,
        },
      });

      await notifyBookingConfirmed(user.id, trip, seatNumber);

      return res.status(201).json(booking);
    } catch (err: any) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Bu o'rindiq allaqachon band qilingan" });
      }
      throw err;
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
