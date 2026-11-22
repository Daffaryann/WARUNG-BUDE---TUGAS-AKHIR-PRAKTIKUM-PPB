# WaroengBude — React + Vite + PWA

Aplikasi toko sembako online berbasis React, siap disambungkan ke Supabase.

---

## 🚀 Cara Menjalankan

### 1. Install dependencies
```bash
npm install
```

### 2. Jalankan development server
```bash
npm run dev
```
Buka di browser: `http://localhost:5173`

### 3. Build untuk production
```bash
npm run build
```

### 4. Preview hasil build
```bash
npm run preview
```

---

## 📁 Struktur Folder

```
src/
├── App.jsx                  ← Root component, routing auth/user/admin
├── main.jsx                 ← Entry point React
├── index.css                ← Semua CSS global (port dari HTML asli)
│
├── components/
│   ├── Toast.jsx            ← Notifikasi toast
│   ├── Modal.jsx            ← Modal dialog
│   └── Struk.jsx            ← Komponen struk (cetak & download)
│
├── context/
│   └── AppContext.jsx       ← Global state provider
│
├── store/
│   └── useStore.js          ← State management (produk, cart, auth, trx)
│
├── hooks/
│   └── useSupabase.js       ← Hooks Supabase (siap pakai nanti)
│
├── lib/
│   └── supabase.js          ← Konfigurasi Supabase client
│
└── pages/
    ├── auth/
    │   └── AuthPages.jsx    ← Login, Register, Admin Login
    ├── user/
    │   └── UserApp.jsx      ← Semua halaman user (Beranda, Produk, Keranjang, dll)
    └── admin/
        └── AdminApp.jsx     ← Panel admin (Dashboard, Kelola Produk, Transaksi)
```

---

## 🔐 Akun Demo

| Role  | Username | Password  |
|-------|----------|-----------|
| User  | user     | user123   |
| Admin | admin    | admin123  |

---

## 🗄️ Integrasi Supabase (Langkah Selanjutnya)

### 1. Buat project Supabase
- Buka https://supabase.com/dashboard
- Klik **New Project**
- Catat **Project URL** dan **Anon Key**

### 2. Isi konfigurasi
Edit file `src/lib/supabase.js`:
```js
const SUPABASE_URL  = 'https://xxxx.supabase.co'  // ← URL project kamu
const SUPABASE_ANON = 'eyJxxxx...'                 // ← Anon Key kamu
```

### 3. Install Supabase client
```bash
npm install @supabase/supabase-js
```

### 4. Buat tabel di Supabase (SQL Editor)
```sql
-- Tabel produk
create table produk (
  id bigint primary key generated always as identity,
  nama text not null,
  kat text,
  "hB" bigint default 0,
  "hJ" bigint default 0,
  stok bigint default 0,
  sat text,
  img text,
  created_at timestamptz default now()
);

-- Tabel transaksi
create table transaksi (
  id text primary key,
  user_id uuid references auth.users,
  nama text,
  tgl text,
  total bigint,
  metode text,
  bukti text,
  items jsonb,
  created_at timestamptz default now()
);

-- Enable RLS (Row Level Security)
alter table produk enable row level security;
alter table transaksi enable row level security;

-- Policy: semua bisa baca produk
create policy "produk_read" on produk for select using (true);
-- Policy: hanya admin yang bisa insert/update/delete produk
-- (nanti tambahkan setelah auth setup)
```

### 5. Ganti data dummy dengan Supabase
Di `src/store/useStore.js`, ganti `useState(INITIAL_PRODUK)` dengan
hook dari `src/hooks/useSupabase.js` yang sudah disiapkan.

---

## 📱 PWA — Cara Install di HP

Setelah `npm run build` dan deploy:
1. Buka URL app di Chrome (Android) atau Safari (iOS)
2. Muncul banner "Add to Home Screen" → tap **Install**
3. App terinstall seperti aplikasi native

---

## 🌐 Deploy ke Vercel (Gratis)

```bash
npm install -g vercel
vercel
```
Ikuti instruksinya, app langsung online dengan URL gratis.

---

© 2026 Berkat Jaya — WaroengBude
