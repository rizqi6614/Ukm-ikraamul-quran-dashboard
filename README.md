# 📖 UKM iKRAAMUL QUR'AN — Digital Dashboard

Dashboard manajemen digital untuk UKM Ikraamul Qur'an, dibangun dengan React + Express.js + MySQL.

## ✨ Fitur Utama

- 🔐 **Autentikasi** — Login & Registrasi anggota
- 📊 **Dashboard Overview** — Statistik, grafik, dan leaderboard
- 👥 **Manajemen Anggota** — CRUD data anggota UKM
- 📅 **Manajemen Kajian** — Jadwal & manajemen kegiatan
- ✅ **Presensi GPS & QR** — Absensi berbasis lokasi dan QR Code
- 📖 **Setoran Hafalan** — Rekap hafalan Al-Qur'an per anggota
- 🏆 **Poin Berkah & Reward** — Gamifikasi dan penukaran hadiah
- 🤖 **AI Chat (Gemini)** — Asisten AI berbasis Google Gemini

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | TailwindCSS v4 |
| Backend | Express.js (Node.js) |
| Database | MySQL 8 / MariaDB (fallback: JSON file) |
| AI | Google Gemini API (`@google/genai`) |
| Charts | Recharts |

## 🚀 Cara Menjalankan Lokal

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/ukm-ikraamul-quran-dashboard.git
cd ukm-ikraamul-quran-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```
Isi file `.env` dengan konfigurasi:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=development

# Opsional — jika pakai MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ikraamul_quran_db
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka http://localhost:3000

## 🌐 Deploy ke Railway

1. Push ke GitHub
2. Buka [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Pilih repository ini
4. Tambahkan **MySQL Plugin** dari Railway dashboard
5. Set environment variables di Settings → Variables:
   - `GEMINI_API_KEY`
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (dari Railway MySQL)
   - `NODE_ENV=production`
6. Railway otomatis menjalankan `npm run start`

## 📋 Scripts

| Command | Deskripsi |
|---|---|
| `npm run dev` | Jalankan server development |
| `npm run build` | Build production (frontend + backend) |
| `npm run start` | Jalankan server production |
| `npm run lint` | TypeScript type check |

## 🗄️ Database

Aplikasi mendukung dua mode database:
- **MySQL** — Set variabel `DB_HOST`, `DB_USER`, `DB_NAME`, `DB_PASSWORD`
- **JSON Fallback** — Otomatis digunakan jika variabel DB tidak diset, data disimpan di `database_store.json`

Schema SQL tersedia di `databaseikra.sql`

## 📁 Struktur Project

```
├── src/
│   ├── components/     # React components
│   ├── types.ts        # TypeScript types
│   └── App.tsx         # Root component
├── public/             # Static assets
├── server.ts           # Express backend server
├── vite.config.ts      # Vite configuration
├── .env.example        # Template environment variables
└── package.json
```

## 🔑 Login Default

| Email | Role |
|---|---|
| `rizqielektronika@gmail.com` | Admin |
| `ahmad@gmail.com` | Pengurus |
| `zuhair@gmail.com` | Anggota |

> Password: masukkan email yang sama (tidak ada validasi password di mode demo)

---

Dibuat dengan ❤️ untuk UKM iKRAAMUL QUR'AN
