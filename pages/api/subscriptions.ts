import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { requireUser } from "../../lib/auth";
import { notifyNewSubscriber } from "../../lib/notify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === "GET") {
    const subs = await prisma.subscription.findMany({
      where: { passengerId: user.id },
      include: { driver: { include: { user: { select: { fullName: true } } } } },
    });
    return res.status(200).json(subs);
  }

  if (req.method === "POST") {
    const { qrCodeId } = req.body || {};
    if (!qrCodeId) return res.status(400).json({ error: "QR kod ID kerak" });

    const driver = await prisma.driver.findUnique({ where: { qrCodeId } });
    if (!driver) return res.status(404).json({ error: "Haydovchi topilmadi" });
    if (driver.userId === user.id) {
      return res.status(400).json({ error: "O'zingizga obuna bo'la olmaysiz" });
    }

    const sub = await prisma.subscription.upsert({
      where: { driverId_passengerId: { driverId: driver.id, passengerId: user.id } },
      update: {},
      create: { driverId: driver.id, passengerId: user.id },
    });

    await notifyNewSubscriber(driver.userId, user.fullName);

    return res.status(201).json(sub);
  }

  if (req.method === "DELETE") {
    const { driverId } = req.body || {};
    if (!driverId) return res.status(400).json({ error: "driverId kerak" });
    await prisma.subscription.deleteMany({ where: { driverId, passengerId: user.id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
