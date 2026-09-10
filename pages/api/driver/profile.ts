import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/auth";
import { defaultSeatLayout } from "../../../lib/seatLayout";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === "GET") {
    const driver = await prisma.driver.findUnique({ where: { userId: user.id } });
    return res.status(200).json(driver);
  }

  if (req.method === "POST") {
    const { carModel, carPlate, carColor, totalSeats, defaultFrom, defaultTo, defaultPrice } =
      req.body || {};

    if (!carModel || !carPlate || !totalSeats || typeof carModel !== "string" || typeof carPlate !== "string") {
      return res.status(400).json({ error: "Moshina modeli, raqami va joylar soni majburiy" });
    }
    if (carModel.length > 60 || carPlate.length > 20 || (carColor && String(carColor).length > 30)) {
      return res.status(400).json({ error: "Kiritilgan matn juda uzun" });
    }

    const seatsNum = Number(totalSeats);
    if (!Number.isFinite(seatsNum)) {
      return res.status(400).json({ error: "Joylar soni noto'g'ri" });
    }
    const seats = Math.max(1, Math.min(8, Math.round(seatsNum)));
    const seatLayout = defaultSeatLayout(seats).map((s) => s.id);

    let price: number | null = null;
    if (defaultPrice) {
      const parsedPrice = Number(defaultPrice);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: "Narx noto'g'ri" });
      }
      price = parsedPrice;
    }

    const driver = await prisma.driver.upsert({
      where: { userId: user.id },
      update: {
        carModel,
        carPlate,
        carColor: carColor || null,
        totalSeats: seats,
        seatLayout,
        defaultFrom: defaultFrom || null,
        defaultTo: defaultTo || null,
        defaultPrice: price,
      },
      create: {
        userId: user.id,
        carModel,
        carPlate,
        carColor: carColor || null,
        totalSeats: seats,
        seatLayout,
        defaultFrom: defaultFrom || null,
        defaultTo: defaultTo || null,
        defaultPrice: price,
      },
    });

    if (user.role !== "DRIVER") {
      await prisma.user.update({ where: { id: user.id }, data: { role: "DRIVER" } });
    }

    return res.status(200).json(driver);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
