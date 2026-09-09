import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  const trip = await prisma.trip.findUnique({
    where: { id: String(id) },
    include: {
      driver: {
        select: {
          id: true,
          carColor: true,
          qrCodeId: true,
          seatLayout: true,
          user: { select: { fullName: true, phone: true } },
        },
      },
      bookings: { where: { status: { not: "CANCELLED" } }, select: { seatNumber: true } },
    },
  });

  if (!trip) return res.status(404).json({ error: "Qatnov topilmadi" });

  return res.status(200).json({
    id: trip.id,
    fromCity: trip.fromCity,
    toCity: trip.toCity,
    departAt: trip.departAt,
    pricePerSeat: trip.pricePerSeat,
    totalSeats: trip.totalSeats,
    seatLayout: trip.seatLayout ?? trip.driver.seatLayout,
    status: trip.status,
    carModel: trip.carModel,
    carPlate: trip.carPlate,
    carColor: trip.driver.carColor,
    driverName: trip.driver.user.fullName,
    driverPhone: trip.driver.user.phone,
    driverId: trip.driver.id,
    driverQrCodeId: trip.driver.qrCodeId,
    bookedSeats: trip.bookings.map((b) => b.seatNumber),
  });
}
