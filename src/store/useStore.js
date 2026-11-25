import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── DATA AWAL (fallback jika Supabase belum terisi) ──
export const INITIAL_PRODUK = [
  { id: 1,  nama: 'Telur Ayam Negeri',        kat: 'Makanan',      hB: 24000, hJ: 28000, stok: 120, sat: 'butir',   img: '' },
  { id: 2,  nama: 'Minyak Goreng Bimoli 2L',  kat: 'Makanan',      hB: 28000, hJ: 32000, stok: 2,   sat: 'botol',   img: '' },
  { id: 3,  nama: 'Gula Pasir Rose Brand 1kg',kat: 'Makanan',      hB: 13000, hJ: 16000, stok: 3,   sat: 'bungkus', img: '' },
  { id: 4,  nama: 'Beras Premium 5kg',        kat: 'Makanan',      hB: 62000, hJ: 72000, stok: 30,  sat: 'karung',  img: '' },
  { id: 5,  nama: 'Sabun Lifebuoy Batang',    kat: 'Kebersihan',   hB: 3500,  hJ: 5000,  stok: 48,  sat: 'batang',  img: '' },
  { id: 6,  nama: 'Indomie Goreng',           kat: 'Makanan',      hB: 3000,  hJ: 3500,  stok: 150, sat: 'bungkus', img: '' },
  { id: 7,  nama: 'Teh Botol Sosro 350ml',    kat: 'Minuman',      hB: 4000,  hJ: 5500,  stok: 36,  sat: 'botol',   img: '' },
  { id: 8,  nama: 'Shampo Pantene Sachet',    kat: 'Kebersihan',   hB: 1000,  hJ: 1500,  stok: 4,   sat: 'sachet',  img: '' },
  { id: 9,  nama: 'Kecap Manis ABC 135ml',    kat: 'Bumbu Dapur',  hB: 5500,  hJ: 7000,  stok: 22,  sat: 'botol',   img: '' },
  { id: 10, nama: 'Pulpen Pilot BPS-GP',      kat: 'Alat Tulis',   hB: 3000,  hJ: 4500,  stok: 35,  sat: 'buah',    img: '' },
  { id: 11, nama: 'Aqua 600ml',               kat: 'Minuman',      hB: 2500,  hJ: 3500,  stok: 60,  sat: 'botol',   img: '' },
  { id: 12, nama: 'Rinso Detergen 900gr',     kat: 'Kebersihan',   hB: 18000, hJ: 22000, stok: 8,   sat: 'bungkus', img: '' },
]

export const INITIAL_TRX = [
  { id: 'TRX-0023', user: 'pak_budi', nama: 'Budi Santoso', tgl: '17 Nov 2026, 11:42', total: 34500, metode: 'cash', bukti: '', items: [{ nama: 'Indomie Goreng', qty: 5, h: 3500, sat: 'bungkus' }, { nama: 'Teh Botol Sosro', qty: 2, h: 5500, sat: 'botol' }, { nama: 'Sabun Lifebuoy', qty: 1, h: 5000, sat: 'batang' }] },
  { id: 'TRX-0022', user: 'siti_r',   nama: 'Siti Rahayu',  tgl: '17 Nov 2026, 09:15', total: 58000, metode: 'transfer', bukti: '', items: [{ nama: 'Telur Ayam Negeri', qty: 1, h: 28000, sat: 'butir' }, { nama: 'Gula Pasir 1kg', qty: 1, h: 16000, sat: 'bungkus' }, { nama: 'Minyak Goreng', qty: 1, h: 14000, sat: 'botol' }] },
  { id: 'TRX-0021', user: 'pak_budi', nama: 'Budi Santoso', tgl: '16 Nov 2026, 15:30', total: 21000, metode: 'cash', bukti: '', items: [{ nama: 'Aqua 600ml', qty: 3, h: 3500, sat: 'botol' }, { nama: 'Indomie Goreng', qty: 3, h: 3500, sat: 'bungkus' }] },
]

export const INITIAL_USERS = [
  { u: 'user',  p: 'user123',  nama: 'Budi Santoso', role: 'user' },
  { u: 'admin', p: 'admin123', nama: 'Admin Toko',    role: 'admin' },
]

// ── HOOK UTAMA ──
let _nId = 200

export function useStore() {
  // Ambil produk dari Supabase
  const [produk, setProduk]   = useState([])
  const [trx, setTrx]         = useState([])
  const [heroImg, setHeroImg] = useState('')
  const [users]               = useState(INITIAL_USERS)
  const [cart, setCart]       = useState([])
  const [cu, setCu]           = useState(null)   // current user

  // ── FETCH PRODUK, TRANSAKSI, & BANNER DARI SUPABASE ──
  useEffect(() => {
    supabase.from('produk').select('*').order('id')
      .then(({ data, error }) => {
        if (data && data.length > 0) {
          setProduk(data)
        } else if (error) {
          console.warn('Supabase fetch error, fallback ke data lokal:', error.message)
          setProduk(INITIAL_PRODUK)
        } else {
          setProduk(data || INITIAL_PRODUK)
        }
      })
      .catch(() => {
        setProduk(INITIAL_PRODUK)
      })

    supabase.from('transaksi').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) setTrx(data)
        else if (error) console.warn('Fetch transaksi gagal:', error.message)
      })
      .catch(() => {})

    supabase.storage.from('produk-images').list('banner', { limit: 1 })
      .then(({ data }) => {
        if (data && data.length > 0) {
          const { data: urlData } = supabase.storage.from('produk-images').getPublicUrl(`banner/${data[0].name}`)
          if (urlData?.publicUrl) setHeroImg(urlData.publicUrl)
        }
      })
      .catch(() => {})
  }, [])

  // ── SINKRONISASI SESSION SUPABASE AUTH ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCu({
          u: session.user.email,
          nama: session.user.user_metadata?.nama || session.user.email.split('@')[0],
          role: 'user',
          id: session.user.id
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCu({
          u: session.user.email,
          nama: session.user.user_metadata?.nama || session.user.email.split('@')[0],
          role: 'user',
          id: session.user.id
        })
      } else {
        setCu(prev => (prev?.isGuest ? prev : null))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── FORMAT RUPIAH ──
  const rp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

  // ── CART ──
  const addCart = useCallback((id) => {
    const p = produk.find(x => x.id === id)
    if (!p || p.stok === 0) return { ok: false, msg: 'Stok habis' }
    setCart(prev => {
      const ci = prev.find(c => c.id === id)
      if (ci) {
        if (ci.qty >= p.stok) return prev // stok tidak cukup
        return prev.map(c => c.id === id ? { ...c, qty: c.qty + 1 } : c)
      }
      return [...prev, { id: p.id, nama: p.nama, harga: p.hJ, qty: 1, img: p.img, sat: p.sat }]
    })
    return { ok: true, msg: p.nama + ' ditambahkan' }
  }, [produk])

  const ubahQty = useCallback((id, delta) => {
    const p = produk.find(x => x.id === id)
    setCart(prev => {
      const ci = prev.find(c => c.id === id)
      if (!ci) return prev
      const newQty = ci.qty + delta
      if (newQty <= 0) return prev.filter(c => c.id !== id)
      if (p && newQty > p.stok) return prev
      return prev.map(c => c.id === id ? { ...c, qty: newQty } : c)
    })
  }, [produk])

  const delCart = useCallback((id) => setCart(prev => prev.filter(c => c.id !== id)), [])
  const clearCart = useCallback(() => setCart([]), [])

  const cartTotal = cart.reduce((a, c) => a + c.harga * c.qty, 0)
  const cartCount = cart.reduce((a, c) => a + c.qty, 0)

  // ── CHECKOUT & SIMPAN TRANSAKSI KE SUPABASE ──
  const konfirmasi = useCallback(async (metode, bukti, buktiFile = null) => {
    const now = new Date()
    const tgl = now.toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    // Hitung jumlah transaksi yang sudah ada di tabel transaksi
    const { count } = await supabase
      .from('transaksi')
      .select('*', { count: 'exact', head: true })

    // Format menjadi TRX-01, TRX-02, dst.
    const nomorUrut = String((count || 0) + 1).padStart(2, '0')
    const idTransaksi = `TRX-${nomorUrut}`

    const total = cartTotal

    let buktiUrl = metode === 'transfer' ? bukti : ''
    if (metode === 'transfer' && buktiFile) {
      const ext = buktiFile.name?.split('.').pop() || 'jpg'
      const path = `bukti/${idTransaksi}-${Date.now()}.${ext}`
      // Coba bucket bukti-transfer terlebih dahulu, jika tidak ada fallback ke produk-images
      let uploaded = null
      const { error: errBucket } = await supabase.storage.from('bukti-transfer').upload(path, buktiFile, { upsert: true })
      if (!errBucket) {
        uploaded = supabase.storage.from('bukti-transfer').getPublicUrl(path)?.data?.publicUrl
      } else {
        const { error: errFallback } = await supabase.storage.from('produk-images').upload(path, buktiFile, { upsert: true })
        if (!errFallback) {
          uploaded = supabase.storage.from('produk-images').getPublicUrl(path)?.data?.publicUrl
        }
      }
      if (uploaded) buktiUrl = uploaded
    }

    const itemsPayload = cart.map(c => ({ nama: c.nama, qty: c.qty, h: c.harga, sat: c.sat }))
    const baseData = {
      id: idTransaksi,
      nama: cu ? cu.nama : 'Tamu',
      tgl: tgl + ', ' + jam,
      total,
      metode,
      bukti: buktiUrl,
      items: itemsPayload,
    }

    const trxWithUser = {
      ...baseData,
      user: cu && !cu.isGuest ? cu.u : 'tamu',
    }

    // Simpan transaksi ke Supabase
    let insertError = null
    const { error: firstErr } = await supabase.from('transaksi').insert([trxWithUser])
    if (firstErr) {
      // Jika tabel memakai kolom user_id (uuid) alih-alih user (text), coba ulang dengan user_id
      if (firstErr.message?.includes('user') && !firstErr.message?.includes('user_id')) {
        const trxWithUserId = {
          ...baseData,
          ...(cu?.id ? { user_id: cu.id } : {}),
        }
        const { error: secondErr } = await supabase.from('transaksi').insert([trxWithUserId])
        insertError = secondErr
      } else {
        insertError = firstErr
      }
    }

    if (insertError) {
      console.warn('Gagal menyimpan transaksi ke Supabase:', insertError.message)
      return { ok: false, error: insertError.message }
    }

    const savedTrx = { ...trxWithUser }
    setTrx(prev => [savedTrx, ...prev])

    // Kurangi stok di Supabase & state lokal
    for (const ci of cart) {
      const prod = produk.find(p => p.id === ci.id)
      if (prod) {
        const newStok = Math.max(0, prod.stok - ci.qty)
        await supabase.from('produk').update({ stok: newStok }).eq('id', ci.id)
      }
    }
    setProduk(prev => prev.map(p => {
      const ci = cart.find(c => c.id === p.id)
      return ci ? { ...p, stok: Math.max(0, p.stok - ci.qty) } : p
    }))
    setCart([])
    return { ok: true, data: savedTrx }
  }, [cart, cartTotal, cu, produk])

  // ── UPLOAD FOTO KE SUPABASE STORAGE ──
  const uploadFoto = useCallback(async (file, produkId = 'new') => {
    try {
      const ext = file.name?.split('.').pop() || 'jpg'
      const path = `produk/${produkId}-${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('produk-images')
        .upload(path, file, { upsert: true })
      if (error) {
        console.warn('Upload foto ke Supabase Storage gagal:', error.message)
        return null
      }
      const { data: url } = supabase.storage.from('produk-images').getPublicUrl(path)
      return url?.publicUrl || null
    } catch (err) {
      console.warn('Upload foto error:', err)
      return null
    }
  }, [])

  // ── PRODUK ADMIN ──
  const saveProduk = useCallback(async (data) => {
    const { id, imgFile, ...rest } = data
    let imgUrl = rest.img || ''

    // 1. Upload foto ke Supabase Storage terlebih dahulu jika ada file baru
    if (imgFile) {
      const uploadedUrl = await uploadFoto(imgFile, id || 'new')
      if (!uploadedUrl) {
        return { ok: false, msg: 'Gagal upload foto ke Storage (produk-images). Cek policy bucket Supabase.' }
      }
      imgUrl = uploadedUrl
    }

    const payload = {
      nama: rest.nama,
      kat: rest.kat,
      sat: rest.sat,
      hB: rest.hB,
      hJ: rest.hJ,
      stok: rest.stok,
      img: imgUrl,
    }

    // 2. Simpan (.update / .insert) ke tabel produk Supabase
    if (id) {
      const { data: updated, error } = await supabase
        .from('produk')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      if (error) {
        console.warn('Update produk ke Supabase gagal:', error.message)
        return { ok: false, msg: 'Gagal update produk: ' + error.message }
      }
      setProduk(prev => prev.map(p => p.id === id ? (updated || { ...p, ...payload }) : p))
      return { ok: true, data: updated }
    } else {
      const { data: inserted, error } = await supabase
        .from('produk')
        .insert(payload)
        .select()
        .single()
      if (error) {
        console.warn('Insert produk ke Supabase gagal:', error.message)
        return { ok: false, msg: 'Gagal simpan produk: ' + error.message }
      }
      setProduk(prev => [...prev, inserted])
      return { ok: true, data: inserted }
    }
  }, [uploadFoto])

  const delProduk = useCallback(async (id) => {
    const { error } = await supabase.from('produk').delete().eq('id', id)
    if (error) {
      console.warn('Hapus produk di Supabase gagal:', error.message)
      return { ok: false, msg: error.message }
    }
    setProduk(prev => prev.filter(p => p.id !== id))
    return { ok: true }
  }, [])

  const updateProdukImg = useCallback(async (id, fileOrUrl) => {
    let imgUrl = typeof fileOrUrl === 'string' ? fileOrUrl : ''

    if (fileOrUrl instanceof File) {
      const uploadedUrl = await uploadFoto(fileOrUrl, id)
      if (!uploadedUrl) {
        return { ok: false, msg: 'Gagal upload foto ke Storage (produk-images)' }
      }
      imgUrl = uploadedUrl
    }

    if (!imgUrl) return { ok: false, msg: 'Foto tidak valid' }

    const { error } = await supabase
      .from('produk')
      .update({ img: imgUrl })
      .eq('id', id)

    if (error) {
      console.warn('Update foto produk di Supabase gagal:', error.message)
      return { ok: false, msg: 'Gagal update foto ke database: ' + error.message }
    }

    setProduk(prev => prev.map(p => p.id === id ? { ...p, img: imgUrl } : p))
    return { ok: true, url: imgUrl }
  }, [uploadFoto])

  // ── UPLOAD BANNER HERO KE SUPABASE STORAGE ──
  const uploadBanner = useCallback(async (file) => {
    try {
      const ext = file.name?.split('.').pop() || 'jpg'
      const path = `banner/hero-banner.${ext}`
      const { data: existing } = await supabase.storage.from('produk-images').list('banner')
      if (existing && existing.length > 0) {
        const oldPaths = existing.map(f => `banner/${f.name}`).filter(p => p !== path)
        if (oldPaths.length > 0) {
          await supabase.storage.from('produk-images').remove(oldPaths)
        }
      }
      const { error } = await supabase.storage
        .from('produk-images')
        .upload(path, file, { upsert: true })
      if (error) {
        console.warn('Upload banner gagal:', error.message)
        return { ok: false, msg: 'Gagal upload banner: ' + error.message }
      }
      const { data: urlData } = supabase.storage.from('produk-images').getPublicUrl(path)
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`
      setHeroImg(publicUrl)
      return { ok: true, url: publicUrl }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Upload banner error' }
    }
  }, [])

  // ── AUTH ──
  const login = useCallback((u, p) => {
    const f = users.find(x => x.u === u && x.p === p && x.role === 'user')
    if (!f) return false
    setCu(f)
    return true
  }, [users])

  const loginAdmin = useCallback((u, p) => {
    const f = users.find(x => x.u === u && x.p === p && x.role === 'admin')
    if (!f) return false
    setCu(f)
    return true
  }, [users])

  const loginGuest = useCallback(() => {
    setCu({ u: 'guest', nama: 'Tamu', role: 'user', isGuest: true })
  }, [])

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch {}
    setCu(null)
    setCart([])
  }, [])

  const userTrx = cu ? trx.filter(t => t.user === cu.u) : []
  const kritis  = produk.filter(p => p.stok <= 5 && p.stok > 0)

  return {
    produk, trx, heroImg, users, cart, cu, rp,
    cartTotal, cartCount, userTrx, kritis,
    addCart, ubahQty, delCart, clearCart,
    konfirmasi, uploadFoto, uploadBanner,
    saveProduk, delProduk, updateProdukImg,
    login, loginAdmin, loginGuest, logout,
    setProduk, setTrx,
  }
}
