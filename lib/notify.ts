import { prisma } from "./prisma";
import type { Trip, Driver } from "@prisma/client";

export async function notifyNewTrip(trip: Trip, driver: Driver) {
  const subscribers = await prisma.subscription.findMany({
    where: { driverId: driver.id },
    select: { passengerId: true },
  });
  if (subscribers.length === 0) return;

  await prisma.notification.createMany({
    data: subscribers.map((s) => ({
      userId: s.passengerId,
      type: "NEW_TRIP" as const,
      title: "Yangi qatnov e'lon qilindi",
      body: `Obuna bo'lgan haydovchingiz ${trip.fromCity} → ${trip.toCity} yo'nalishida yangi qatnov e'lon qildi.`,
      tripId: trip.id,
    })),
  });
}

export async function notifyTripStarted(tripId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { driver: true, bookings: { where: { status: { not: "CANCELLED" } } } },
  });
  if (!trip) return;

  const passengerIds = new Set(trip.bookings.map((b) => b.passengerId));

  const subscribers = await prisma.subscription.findMany({
    where: { driverId: trip.driverId },
    select: { passengerId: true },
  });
  subscribers.forEach((s) => passengerIds.add(s.passengerId));

  if (passengerIds.size === 0) return;

  await prisma.notification.createMany({
    data: Array.from(passengerIds).map((userId) => ({
      userId,
      type: "TRIP_STARTED" as const,
      title: "Haydovchi yo'lga chiqdi",
      body: `${trip.carModel} (${trip.carPlate}) ${trip.fromCity} → ${trip.toCity} yo'nalishida yo'lga chiqdi. Narsalaringizni tayyorlab turing!`,
      tripId: trip.id,
    })),
  });
}

export async function notifyBookingConfirmed(passengerId: string, trip: Trip, seatNumber: string) {
  await prisma.notification.create({
    data: {
      userId: passengerId,
      type: "BOOKING_CONFIRMED",
      title: "Bron tasdiqlandi",
      body: `${trip.fromCity} → ${trip.toCity} qatnovida ${seatNumber} o'rindiq siz uchun bron qilindi.`,
      tripId: trip.id,
    },
  });
}

export async function notifyNewSubscriber(driverUserId: string, passengerName: string) {
  await prisma.notification.create({
    data: {
      userId: driverUserId,
      type: "NEW_SUBSCRIBER",
      title: "Yangi obunachi",
      body: `${passengerName} sizga obuna bo'ldi.`,
    },
  });
}
