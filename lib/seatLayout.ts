// Standart avtomobil o'rindiqlar maketlari.
// Har bir seat "id" bazada va bronlarda ishlatiladi, "label" foydalanuvchiga ko'rsatiladi.

export interface SeatDef {
  id: string;
  label: string;
  row: number; // 2D joylashuv uchun qator
  col: number; // 2D joylashuv uchun ustun
}

export const SEAT_LABELS: Record<string, string> = {
  front_right: "Old o'ng",
  back_left: "Orqa chap",
  back_middle: "Orqa o'rta",
  back_right: "Orqa o'ng",
  row2_left: "3-qator chap",
  row2_middle: "3-qator o'rta",
  row2_right: "3-qator o'ng",
};

// 4 o'rindiqli sedan (standart taksi)
const LAYOUT_4: SeatDef[] = [
  { id: "front_right", label: SEAT_LABELS.front_right, row: 0, col: 1 },
  { id: "back_left", label: SEAT_LABELS.back_left, row: 1, col: 0 },
  { id: "back_middle", label: SEAT_LABELS.back_middle, row: 1, col: 1 },
  { id: "back_right", label: SEAT_LABELS.back_right, row: 1, col: 2 },
];

// 3 o'rindiqli (orqa o'rtasiz)
const LAYOUT_3: SeatDef[] = [
  { id: "front_right", label: SEAT_LABELS.front_right, row: 0, col: 1 },
  { id: "back_left", label: SEAT_LABELS.back_left, row: 1, col: 0 },
  { id: "back_right", label: SEAT_LABELS.back_right, row: 1, col: 2 },
];

// 7 o'rindiqli miniven
const LAYOUT_7: SeatDef[] = [
  ...LAYOUT_4,
  { id: "row2_left", label: SEAT_LABELS.row2_left, row: 2, col: 0 },
  { id: "row2_middle", label: SEAT_LABELS.row2_middle, row: 2, col: 1 },
  { id: "row2_right", label: SEAT_LABELS.row2_right, row: 2, col: 2 },
];

export function defaultSeatLayout(totalSeats: number): SeatDef[] {
  // Har doim aynan `totalSeats` sonidagi o'rindiq qaytariladi — bu qatnov
  // to'lganligini (FULL) aniqlashning to'g'riligi uchun muhim.
  if (totalSeats <= 3) return LAYOUT_3.slice(0, totalSeats);
  if (totalSeats <= 4) return LAYOUT_4;
  return LAYOUT_7.slice(0, totalSeats);
}

export function seatLabel(id: string): string {
  return SEAT_LABELS[id] || id;
}
