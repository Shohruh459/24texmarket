import { prisma } from "./prisma";
import type { Trip, Driver } from "@prisma/client";
import { seatLabel } from "./seatLayout";

function formatPickup(pickupLat?: number | null, pickupLng?: number | null, pickupNote?: string | null): string {
  const parts: string[] = [];
  if (pickupNote) parts.push(`"${pickupNote}"`);
  if (pickupLat != null && pickupLng != null) {
    parts.push(`https://www.google.com/maps?q=${pickupLat},${pickupLng}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "yo'lovchi manzil belgilamagan";
}

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

export async function notifyDriverNewBooking(
  driverUserId: string,
  trip: Trip,
  passengerName: string,
  seatNumber: string,
  pickupLat?: number | null,
  pickupLng?: number | null,
  pickupNote?: string | null
) {
  await prisma.notification.create({
    data: {
      userId: driverUserId,
      type: "NEW_BOOKING",
      title: "Yangi bron!",
      body: `${passengerName} ${trip.fromCity} → ${trip.toCity} qatnovida "${seatLabel(
        seatNumber
      )}" o'rindiqni band qildi. Olib ketish manzili: ${formatPickup(pickupLat, pickupLng, pickupNote)}`,
      tripId: trip.id,
    },
  });
}

export async function notifyTripFull(driverUserId: string, trip: Trip) {
  await prisma.notification.create({
    data: {
      userId: driverUserId,
      type: "TRIP_FULL",
      title: "Barcha o'rindiqlar band qilindi",
      body: `${trip.fromCity} → ${trip.toCity} qatnovingizdagi barcha o'rindiqlar band qilindi. Qatnov holati "To'ldi"ga o'zgartirildi.`,
      tripId: trip.id,
    },
  });
}

export async function notifyBookingCancelled(driverUserId: string, trip: Trip, seatNumber: string, passengerName: string) {
  await prisma.notification.create({
    data: {
      userId: driverUserId,
      type: "BOOKING_CANCELLED",
      title: "Bron bekor qilindi",
      body: `${passengerName} ${trip.fromCity} → ${trip.toCity} qatnovidagi "${seatLabel(
        seatNumber
      )}" o'rindiq bronini bekor qildi. Joy yana bo'sh.`,
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
