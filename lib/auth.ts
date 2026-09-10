import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";
import { serialize, parse } from "cookie";
import { prisma } from "./prisma";

const DEV_FALLBACK_SECRET = "dev-secret-change-me";
if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEV_FALLBACK_SECRET)) {
  // Production muhitida standart/bo'sh JWT_SECRET bilan ishga tushirishga yo'l qo'ymaymiz —
  // aks holda token'larni istalgan kishi soxtalashtira oladi.
  throw new Error("JWT_SECRET muhit o'zgaruvchisi production'da albatta o'rnatilishi shart (.env faylida).");
}
const JWT_SECRET = process.env.JWT_SECRET || DEV_FALLBACK_SECRET;
const COOKIE_NAME = "taxi_session";

export interface TokenPayload {
  userId: string;
  role: "PASSENGER" | "DRIVER" | "ADMIN";
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: NextApiResponse, token: string) {
  res.setHeader(
    "Set-Cookie",
    serialize(COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    })
  );
}

export function clearSessionCookie(res: NextApiResponse) {
  res.setHeader(
    "Set-Cookie",
    serialize(COOKIE_NAME, "", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    })
  );
}

export function getTokenFromReq(req: NextApiRequest): string | null {
  const cookies = parse(req.headers.cookie || "");
  return cookies[COOKIE_NAME] || null;
}

export async function getUserFromReq(req: NextApiRequest) {
  const token = getTokenFromReq(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { driver: true },
  });
  return user;
}

export async function requireUser(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromReq(req);
  if (!user) {
    res.status(401).json({ error: "Avtorizatsiyadan o'tilmagan" });
    return null;
  }
  return user;
}
