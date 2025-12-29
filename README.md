# Akademik Yozuv - Imlo Sinovlari

Akademik yozuv virtual laboratoriyasi uchun imlo sinovlari platformasi.

## Texnologiyalar

- **Next.js 14** - React framework
- **MongoDB** - Ma'lumotlar bazasi
- **Mongoose** - MongoDB ODM
- **Tailwind CSS** - Styling
- **TypeScript** - Tip xavfsizligi

## O'rnatish

### 1. Loyihani yuklab olish

```bash
cd akademik-yozuv
npm install
```

### 2. MongoDB sozlash

MongoDB lokal yoki bulutda ishlayotganligiga ishonch hosil qiling.

`.env.local` faylida MongoDB URI ni o'zgartiring (agar kerak bo'lsa):

```
MONGODB_URI=mongodb://localhost:27017/akademik-yozuv
```

### 3. Ma'lumotlar bazasini to'ldirish

```bash
npm run seed
```

Bu buyruq quyidagilarni yaratadi:
- 1 ta admin
- 5 ta mavzu
- 50 ta savol
- 6 ta namuna javob

### 4. Loyihani ishga tushirish

```bash
npm run dev
```

Brauzerda oching: [http://localhost:3000](http://localhost:3000)

## Sahifalar

### Talabalar uchun

| Sahifa | Yo'l | Tavsif |
|--------|------|--------|
| Bosh sahifa | `/` | Mavzu raqamini kiritish |
| Test | `/test/:kod` | Ro'yxatdan o'tish va test |
| Natija | `/natija/:id` | Test natijasi |

### Admin uchun

| Sahifa | Yo'l | Tavsif |
|--------|------|--------|
| Kirish | `/admin` | Admin login |
| Boshqaruv | `/admin/boshqaruv` | Statistika |
| Mavzular | `/admin/mavzular` | Mavzularni boshqarish |
| Mavzu tafsiloti | `/admin/mavzular/:id` | Savollarni boshqarish |
| Javoblar | `/admin/javoblar` | Barcha javoblar |
| Javob tafsiloti | `/admin/javoblar/:id` | Javob tafsiloti |

## Admin kirish ma'lumotlari

```
Email: admin@gmail.com
Parol: password123
```

## Mavzu kodlari

| Mavzu | Kod |
|-------|-----|
| Dissertatsiya va ilmiy ish | 847291 |
| Referat va annotatsiya | 123456 |
| Esse va insho | 654321 |
| Taqriz va reklama | 111222 |
| Akademik matn va terminologiya | 333444 |

## Loyiha tuzilishi

```
src/
├── app/
│   ├── admin/
│   │   ├── boshqaruv/
│   │   ├── javoblar/
│   │   │   └── [id]/
│   │   ├── mavzular/
│   │   │   └── [id]/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/login/
│   │   ├── questions/
│   │   ├── stats/
│   │   ├── submissions/
│   │   └── topics/
│   ├── natija/[submissionId]/
│   ├── test/[topicCode]/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── mongodb.ts
├── models/
│   ├── Admin.ts
│   ├── Question.ts
│   ├── Submission.ts
│   ├── Topic.ts
│   └── index.ts
scripts/
└── seed.js
```

## Foydalanish

### Talaba uchun:

1. Bosh sahifada 6 xonali mavzu kodini kiriting
2. Ism va guruhingizni kiriting
3. Savollarga javob bering
4. Testni yakunlang va natijani ko'ring

### Admin uchun:

1. `/admin` sahifasiga o'ting
2. Email va parol bilan kiring
3. Mavzular, savollar va javoblarni boshqaring

## Ishlab chiqish

```bash
# Development server
npm run dev

# Build
npm run build

# Production server
npm start
```
