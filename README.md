# Akademik Yozuv Virtual Laboratoriyasi

Next.js va MongoDB da qurilgan akademik yozuv platformasi.

## 🚀 Quick Start

### 1. O'rnatish

```bash
npm install
```

### 2. Database Seeding

Admin foydalanuvchini yaratish:

```bash
npx ts-node scripts/seed-admin.ts
```

### 3. Ishga tushirish

```bash
npm run dev
```

Brauzerda [http://localhost:3000](http://localhost:3000) manzilini oching.

## 📚 Hujjatlar

- [SETUP.md](SETUP.md) - To'liq o'rnatish yo'riqnomasi
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Amalga oshirilgan funksiyalar ro'yxati
- [CREDENTIALS.md](CREDENTIALS.md) - Admin kirish ma'lumotlari

## ✨ Xususiyatlar

### Talabalar uchun

- 📚 Mavzular bo'yicha qidiruv
- 📝 Interaktiv testlar (tanlov va matnli savollar)
- ✅ Natijalarni darhol ko'rish
- 📊 Ball hisobi

### Admin panel

- 🔐 JWT autentifikatsiya
- 📊 Statistika dashboard
- 🔑 Parolni yangilash
- 📝 Savollar boshqaruvi (qidiruv va filtrlash)
- 📋 Javoblar ko'rish (qidiruv va filtrlash)
- 🔍 Barcha sahifalarda qidiruv va filtrlash

## 🎯 Mavzular

1. Dissertatsiya va ilmiy ish
2. Referat va annotatsiya
3. Esse va insho
4. Taqriz va reklama
5. Akademik matn va terminologiya

## 🔐 Admin Kirish

**URL**: [http://localhost:3000/admin](http://localhost:3000/admin)

**Kirish ma'lumotlari**:

- Email: `admin@gmail.com`
- Parol: `password123`

⚠️ **Muhim**: Birinchi kirishdan keyin parolni o'zgartiring!

## 💻 Texnologiyalar

### Frontend

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Radix UI
- Lucide Icons
- Sonner (Toast)

### Backend

- Next.js API Routes
- MongoDB Atlas
- JWT Authentication
- bcryptjs (Password Hashing)

## 📁 Loyiha Strukturasi

```text
akademikyozuv/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── api/               # API endpoints
│   │   ├── admin/             # Admin panel
│   │   ├── test/              # Quiz interface
│   │   └── natija/            # Results page
│   ├── models/                # MongoDB models
│   ├── lib/                   # Utilities (auth, db)
│   ├── contexts/              # React Context
│   └── components/            # UI components
├── scripts/                   # Database scripts
└── docs/                      # Documentation
```

## 🔒 Xavfsizlik

- ✅ bcrypt password hashing
- ✅ JWT token authentication (7 days)
- ✅ Protected API routes
- ✅ Input validation
- ✅ Bearer token authorization

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/login` - Admin kirish
- `POST /api/auth/update-password` - Parolni yangilash (auth kerak)

## 📱 Responsive Design

Barcha sahifalar mobil, planshet va desktop uchun optimallashtirilgan.

## 🛠️ Development

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

### Database Seeding

```bash
npx ts-node scripts/seed-admin.ts
```

## 📊 Database Collections

- `admins` - Admin foydalanuvchilar
- `topics` - Mavzular
- `questions` - Savollar
- `submissions` - Talabalar javoblari

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

MIT

## 👥 Authors

Akademik Yozuv jamoasi

## 🐛 Muammolar

Muammo topsangiz yoki takliflaringiz bo'lsa, issue oching.

---

**Eslatma**: Production muhitiga deploy qilishdan oldin `.env` faylini to'g'ri sozlang va kuchli parollar o'rnating.
