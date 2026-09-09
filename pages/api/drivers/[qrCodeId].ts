import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { qrCodeId } = req.query;
  const driver = await prisma.driver.findUnique({
    where: { qrCodeId: String(qrCodeId) },
    include: {
      user: { select: { fullName: true, phone: true } },
      _count: { select: { subscribers: true } },
      trips: {
        where: { status: "SCHEDULED", departAt: { gte: new Date() } },
        orderBy: { departAt: "asc" },
        take: 5,
      },
    },
  });

  if (!driver) return res.status(404).json({ error: "Haydovchi topilmadi" });

  return res.status(200).json({
    id: driver.id,
    fullName: driver.user.fullName,
    carModel: driver.carModel,
    carPlate: driver.carPlate,
    carColor: driver.carColor,
    defaultFrom: driver.defaultFrom,
    defaultTo: driver.defaultTo,
    defaultPrice: driver.defaultPrice,
    subscriberCount: driver._count.subscribers,
    upcomingTrips: driver.trips,
  });
}
