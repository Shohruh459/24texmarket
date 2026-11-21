import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { requireUser } from "../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === "GET") {
    // Navbar faqat o'qilmaganlar sonini ko'rsatadi — u har necha soniyada
    // chaqiriladi, shuning uchun 50 ta qatorni tortmasdan, bitta yengil
    // COUNT so'rovi bilan cheklanamiz (bepul baza limitini tejash uchun).
    if (req.query.countOnly) {
      const unreadCount = await prisma.notification.count({
        where: { userId: user.id, isRead: false },
      });
      return res.status(200).json({ unreadCount });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });
    return res.status(200).json({ notifications, unreadCount });
  }

  if (req.method === "PATCH") {
    const { id } = req.body || {};
    if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: user.id },
        data: { isRead: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
