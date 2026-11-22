// ══════════════════════════════════════════════════════
// SUPABASE CONFIG
// Mengambil konfigurasi dari environment variables (.env)
// ══════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL || 'https://fwsbtpdvpiilmwdogcov.supabase.co'
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_e_FjSAT_M8tOjppICHYuaQ_AN_gQN8W'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ══ TABEL YANG DIBUTUHKAN DI SUPABASE ══
//
// Table: produk
//   id        int8  PK
//   nama      text
//   kat       text
//   hB        int8   (harga beli)
//   hJ        int8   (harga jual)
//   stok      int8
//   sat       text   (satuan)
//   img       text   (URL dari Supabase Storage)
//   created_at timestamptz
//
// Table: transaksi
//   id        text   PK  (TRX-XXXX)
//   user_id   uuid   FK → auth.users
//   nama      text
//   tgl       text
//   total     int8
//   metode    text   ('cash' | 'transfer')
//   bukti     text   (URL bukti transfer)
//   items     jsonb
//   created_at timestamptz
//
// Storage bucket: produk-images
// Storage bucket: bukti-transfer
