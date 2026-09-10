import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/auth";
import { notifyNewTrip } from "../../../lib/notify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res);
  if (!user) return;

  const driver = await prisma.driver.findUnique({ where: { userId: user.id } });
  if (!driver) {
    return res.status(400).json({ error: "Avval haydovchi profilini to'ldiring" });
  }

  if (req.method === "GET") {
    const trips = await prisma.trip.findMany({
      where: { driverId: driver.id },
      orderBy: { departAt: "desc" },
      include: {
        bookings: {
          where: { status: { not: "CANCELLED" } },
          include: { passenger: { select: { fullName: true, phone: true } } },
        },
      },
    });
    return res.status(200).json(trips);
  }

  if (req.method === "POST") {
    const body = req.body || {};

    // "Bir bosishda e'lon qilish": maydonlar berilmasa haydovchi profilidagi
    // doimiy yo'nalish va narx ishlatiladi.
    const fromCity = body.fromCity || driver.defaultFrom;
    const toCity = body.toCity || driver.defaultTo;
    const pricePerSeat = body.pricePerSeat ? Number(body.pricePerSeat) : driver.defaultPrice;
    const departAt = body.departAt ? new Date(body.departAt) : new Date();

    if (!fromCity || !toCity || !pricePerSeat || pricePerSeat <= 0) {
      return res
        .status(400)
        .json({ error: "Yo'nalish va narx kerak (yoki avval profilda doimiy yo'nalish belgilang)" });
    }
    if (Number.isNaN(departAt.getTime())) {
      return res.status(400).json({ error: "Jo'nash vaqti noto'g'ri" });
    }

    const trip = await prisma.trip.create({
      data: {
        driverId: driver.id,
        fromCity,
        toCity,
        departAt,
        pricePerSeat,
        totalSeats: driver.totalSeats,
        seatLayout: driver.seatLayout ?? undefined,
        carModel: driver.carModel,
        carPlate: driver.carPlate,
      },
    });

    await notifyNewTrip(trip, driver);

    return res.status(201).json(trip);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
