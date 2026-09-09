import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromReq } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromReq(req);
  if (!user) {
    return res.status(401).json({ error: "Avtorizatsiyadan o'tilmagan" });
  }
  return res.status(200).json({
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    driver: user.driver
      ? {
          id: user.driver.id,
          carModel: user.driver.carModel,
          carPlate: user.driver.carPlate,
          carColor: user.driver.carColor,
          totalSeats: user.driver.totalSeats,
          seatLayout: user.driver.seatLayout,
          defaultFrom: user.driver.defaultFrom,
          defaultTo: user.driver.defaultTo,
          defaultPrice: user.driver.defaultPrice,
          qrCodeId: user.driver.qrCodeId,
        }
      : null,
  });
}
