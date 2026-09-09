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

    if (!carModel || !carPlate || !totalSeats) {
      return res.status(400).json({ error: "Moshina modeli, raqami va joylar soni majburiy" });
    }

    const seats = Math.max(1, Math.min(8, Number(totalSeats)));
    const seatLayout = defaultSeatLayout(seats).map((s) => s.id);

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
        defaultPrice: defaultPrice ? Number(defaultPrice) : null,
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
        defaultPrice: defaultPrice ? Number(defaultPrice) : null,
      },
    });

    if (user.role !== "DRIVER") {
      await prisma.user.update({ where: { id: user.id }, data: { role: "DRIVER" } });
    }

    return res.status(200).json(driver);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
