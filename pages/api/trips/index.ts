import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { from, to, date, maxPrice } = req.query;

  const where: any = { status: "SCHEDULED" };
  if (from) where.fromCity = { contains: String(from), mode: "insensitive" };
  if (to) where.toCity = { contains: String(to), mode: "insensitive" };
  if (maxPrice) where.pricePerSeat = { lte: Number(maxPrice) };
  if (date) {
    const day = new Date(String(date));
    const start = new Date(day.setHours(0, 0, 0, 0));
    const end = new Date(day.setHours(23, 59, 59, 999));
    where.departAt = { gte: start, lte: end };
  } else {
    where.departAt = { gte: new Date() };
  }

  const trips = await prisma.trip.findMany({
    where,
    orderBy: { departAt: "asc" },
    include: {
      driver: { select: { id: true, carColor: true, qrCodeId: true, user: { select: { fullName: true, phone: true } } } },
      bookings: { where: { status: { not: "CANCELLED" } }, select: { seatNumber: true } },
    },
    take: 50,
  });

  const result = trips.map((t) => ({
    id: t.id,
    fromCity: t.fromCity,
    toCity: t.toCity,
    departAt: t.departAt,
    pricePerSeat: t.pricePerSeat,
    totalSeats: t.totalSeats,
    carModel: t.carModel,
    carPlate: t.carPlate,
    driverName: t.driver.user.fullName,
    driverId: t.driver.id,
    driverQrCodeId: t.driver.qrCodeId,
    freeSeats: t.totalSeats - t.bookings.length,
  }));

  return res.status(200).json(result);
}
