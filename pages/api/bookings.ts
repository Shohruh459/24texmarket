import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { requireUser } from "../../lib/auth";
import { notifyBookingConfirmed, notifyDriverNewBooking, notifyTripFull } from "../../lib/notify";
import { defaultSeatLayout } from "../../lib/seatLayout";

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
    if (!tripId || !seatNumber || typeof seatNumber !== "string") {
      return res.status(400).json({ error: "Qatnov va o'rindiq tanlanishi kerak" });
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: { driver: true } });
    if (!trip) return res.status(404).json({ error: "Qatnov topilmadi" });
    if (trip.status !== "SCHEDULED") {
      return res.status(400).json({ error: "Bu qatnov uchun bron qilib bo'lmaydi (band yoki yakunlangan)" });
    }

    // O'rindiq raqami shu qatnov uchun haqiqatan mavjud maketga tegishli ekanini tekshiramiz —
    // aks holda mijoz o'zboshimchalik bilan noto'g'ri seat ID yuborib o'rindiqlar hisobini buzishi mumkin.
    const layout = ((trip.seatLayout as string[] | null) ?? (trip.driver.seatLayout as string[] | null)) || defaultSeatLayout(trip.totalSeats).map((s) => s.id);
    if (!layout.includes(seatNumber)) {
      return res.status(400).json({ error: "Noto'g'ri o'rindiq tanlandi" });
    }

    const lat = pickupLat != null ? Number(pickupLat) : null;
    const lng = pickupLng != null ? Number(pickupLng) : null;
    if ((lat != null && Number.isNaN(lat)) || (lng != null && Number.isNaN(lng))) {
      return res.status(400).json({ error: "Xaritadagi koordinata noto'g'ri" });
    }

    try {
      // Bron yaratish — (tripId, seatNumber) unique cheklovi bir xil o'rindiqqa
      // bir vaqtda tushgan ikkita so'rovning faqat bittasi muvaffaqiyatli bo'lishini
      // DB darajasida kafolatlaydi (P2002 xatosi quyida ushlanadi).
      const booking = await prisma.booking.create({
        data: {
          tripId,
          passengerId: user.id,
          seatNumber,
          pickupLat: lat,
          pickupLng: lng,
          pickupNote: pickupNote ? String(pickupNote).slice(0, 300) : null,
        },
      });

      // To'lganlikni bron COMMIT bo'lgandan keyin, alohida so'rov bilan tekshiramiz —
      // shunda bir vaqtda kelgan boshqa so'rovlarning committed yozuvlari ham hisobga kiradi.
      // updateMany...where status:SCHEDULED faqat bitta so'rov "to'ldirdi" deb hisoblanishini
      // va bildirishnoma faqat bir marta yuborilishini ta'minlaydi.
      let becameFull = false;
      const confirmedCount = await prisma.booking.count({
        where: { tripId, status: { not: "CANCELLED" } },
      });
      if (confirmedCount >= trip.totalSeats) {
        const result = await prisma.trip.updateMany({
          where: { id: tripId, status: "SCHEDULED" },
          data: { status: "FULL" },
        });
        becameFull = result.count > 0;
      }

      await notifyBookingConfirmed(user.id, trip, seatNumber);
      await notifyDriverNewBooking(trip.driver.userId, trip, user.fullName, seatNumber, lat, lng, pickupNote);
      if (becameFull) {
        await notifyTripFull(trip.driver.userId, trip);
      }

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
