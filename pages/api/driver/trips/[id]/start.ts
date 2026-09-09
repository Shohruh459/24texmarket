import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { requireUser } from "../../../../../lib/auth";
import { notifyTripStarted } from "../../../../../lib/notify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const user = await requireUser(req, res);
  if (!user) return;

  const { id } = req.query;
  const driver = await prisma.driver.findUnique({ where: { userId: user.id } });
  if (!driver) return res.status(400).json({ error: "Haydovchi profili topilmadi" });

  const trip = await prisma.trip.findUnique({ where: { id: String(id) } });
  if (!trip || trip.driverId !== driver.id) {
    return res.status(404).json({ error: "Qatnov topilmadi" });
  }

  const updated = await prisma.trip.update({
    where: { id: trip.id },
    data: { status: "STARTED", startedAt: new Date() },
  });

  await notifyTripStarted(trip.id);

  return res.status(200).json(updated);
}
