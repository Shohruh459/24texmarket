# 24TexMarket — Viloyatlararo Qulay Taksi va Yo'l-yo'lakay

Shaharlararo qatnovchi haydovchilar va arzon yo'l haqi izlayotgan yo'lovchilarni
bog'laydigan platforma. Next.js (Pages Router, TypeScript) + Tailwind CSS +
PostgreSQL (Prisma ORM) asosida qurilgan.

## 1. Talablar

- Node.js 18+ (tavsiya: 20/22)
- PostgreSQL 14+ (lokal yoki masofaviy)
- npm

## 2. O'rnatish

```bash
git clone <repo-url>
cd 24texmarket
npm install
```

`npm install` avtomatik ravishda `prisma generate` ni ham ishga tushiradi
(`postinstall` skripti orqali).

## 3. Muhit o'zgaruvchilari (.env)

`.env.example` faylidan nusxa oling:

```bash
cp .env.example .env
```

`.env` faylini o'zingizning ma'lumotlar bazangizga moslang:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<database>"
JWT_SECRET="ishlab-chiqarishda-albatta-almashtiring"
```

Production muhitida ixtiyoriy ravishda quyidagini ham qo'shishingiz mumkin
(QR-kod havolalari to'g'ri domenni ko'rsatishi uchun):

```env
NEXT_PUBLIC_BASE_URL="https://sizning-domeningiz.uz"
```

## 4. Ma'lumotlar bazasini tayyorlash

Agar baza bo'sh bo'lsa, quyidagi buyruq sxemani yaratadi (production uchun):

```bash
npx prisma migrate deploy
```

Lokal rivojlantirish muhitida yangi migratsiya yaratish kerak bo'lsa:

```bash
npx prisma migrate dev
```

Ma'lumotlar bazasini vizual ko'rish uchun:

```bash
npx prisma studio
```

## 5. Loyihani ishga tushirish

### Rivojlantirish (development) rejimi

```bash
npm run dev
```

Brauzerda oching: http://localhost:3000

### Production build va ishga tushirish

```bash
npm run build
npm run start
```

Standart holatda `next start` 3000-portda ishlaydi (`PORT` muhit o'zgaruvchisi
orqali o'zgartirish mumkin).

## 6. Loyiha tuzilmasi

```
prisma/schema.prisma      — DB sxemasi (User, Driver, Trip, Booking, Subscription, Notification)
lib/                       — Prisma client, auth (JWT), QR generatsiya, bildirishnoma logikasi
components/                — SeatMap (o'rindiqlar maketi), QrScanner, LocationPicker (Leaflet)
pages/api/                 — Backend API endpointlari (auth, driver, trips, bookings, subscriptions, notifications)
pages/                     — Frontend sahifalar (bosh sahifa, ro'yxatdan o'tish, qidiruv, haydovchi paneli va h.k.)
data/cities.ts             — Viloyatlararo qatnovlar uchun shahar/viloyat ro'yxati
```

## 7. Asosiy funksional oqimlar

**Haydovchi:**
1. `/register` — "Haydovchiman" tugmasi bilan ro'yxatdan o'tish
2. `/driver` — moshina va doimiy yo'nalishni bir marta to'ldirish
3. Bir tugma bilan yangi qatnov e'lon qilish (obunachilarga avtomatik xabar boradi)
4. Shaxsiy QR-kod orqali yo'lovchilarni obuna qildirish
5. "Yo'lga chiqdim" tugmasi — barcha obunachi va bron qilganlarga xabar yuboradi

**Yo'lovchi:**
1. `/search` — yo'nalish, sana, narx bo'yicha qidiruv
2. `/trip/[id]` — o'rindiqni tanlash va xaritadan olib ketish nuqtasini belgilash
3. `/scan` — haydovchining QR-kodini skanerlab unga obuna bo'lish
4. `/notifications` — barcha bildirishnomalar (yangi qatnov, yo'lga chiqdi, bron tasdiqlandi)

## 8. Muhim eslatmalar

- Autentifikatsiya telefon raqam + parol asosida, JWT tokeni httpOnly cookie'da saqlanadi.
- Bildirishnomalar hozircha ilova ichida (in-app) ko'rsatiladi; real Telegram/push
  xabarnomalarini ulash uchun `lib/notify.ts` faylidagi funksiyalarga tashqi xizmat
  (masalan, Telegram Bot API) integratsiyasini qo'shish kifoya.
- `JWT_SECRET` va `DATABASE_URL` kabi maxfiy ma'lumotlarni hech qachon repozitoriyga
  commit qilmang — ular faqat `.env` faylida (gitignore qilingan) saqlanadi.
