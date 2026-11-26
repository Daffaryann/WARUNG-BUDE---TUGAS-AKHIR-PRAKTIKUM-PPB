import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ── LOCAL STORAGE KEYS (OFFLINE QUEUE & CACHE) ──
const LS_KEYS = {
  PRODUK_CACHE:   'wb_produk_cache',
  TRX_CACHE:      'wb_trx_cache',
  PENDING_PRODUK: 'wb_pending_produk',
  PENDING_TRX:    'wb_pending_trx',
}

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeLS(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch (err) {
    console.warn('Gagal menyimpan ke localStorage:', err)
  }
}

function dataUrlToFile(dataUrl, filename = 'upload.jpg') {
  try {
    const [header, b64] = dataUrl.split(',')
    const mimeMatch = header.match(/:(.*?);/)
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
    const bin = atob(b64)
    const arr = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
    return new File([arr], filename, { type: mime })
  } catch {
    return null
  }
}

function isNetworkError(errMsg = '') {
  const m = String(errMsg).toLowerCase()
  return !navigator.onLine || m.includes('failed to fetch') || m.includes('network') || m.includes('fetch')
}

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
  // Ambil produk & transaksi dari cache lokal terlebih dahulu (agar tetap tampil saat offline)
  const [produk, setProduk] = useState(() => readLS(LS_KEYS.PRODUK_CACHE, []))
  const [trx, setTrx]       = useState(() => readLS(LS_KEYS.TRX_CACHE, []))
  const [heroImg, setHeroImg] = useState('')
  const [users]               = useState(INITIAL_USERS)
  const [cart, setCart]       = useState([])
  const [cu, setCu]           = useState(null)   // current user
  const [pendingSyncCount, setPendingSyncCount] = useState(
    () => readLS(LS_KEYS.PENDING_PRODUK, []).length + readLS(LS_KEYS.PENDING_TRX, []).length
  )
  const isSyncingRef = useRef(false)

  const refreshPendingCount = useCallback(() => {
    const total = readLS(LS_KEYS.PENDING_PRODUK, []).length + readLS(LS_KEYS.PENDING_TRX, []).length
    setPendingSyncCount(total)
  }, [])

  // Simpan cache produk & transaksi ke localStorage setiap kali berubah
  useEffect(() => {
    if (produk.length > 0) writeLS(LS_KEYS.PRODUK_CACHE, produk)
  }, [produk])

  useEffect(() => {
    writeLS(LS_KEYS.TRX_CACHE, trx)
  }, [trx])

  // ── FETCH PRODUK, TRANSAKSI, & BANNER DARI SUPABASE ──
  useEffect(() => {
    const pendingProds = readLS(LS_KEYS.PENDING_PRODUK, [])
    const pendingTrxs  = readLS(LS_KEYS.PENDING_TRX, [])

    supabase.from('produk').select('*').order('id')
      .then(({ data, error }) => {
        if (data && data.length > 0) {
          // Gabungkan data Supabase dengan produk baru yang masih menunggu sync offline
          const pendingInserts = pendingProds
            .filter(item => item.action === 'insert')
            .map(item => item.localRecord)
          setProduk([...data, ...pendingInserts])
        } else if (error) {
          console.warn('Supabase fetch error, fallback ke cache lokal:', error.message)
          const cached = readLS(LS_KEYS.PRODUK_CACHE, [])
          setProduk(cached.length > 0 ? cached : INITIAL_PRODUK)
        } else {
          const cached = readLS(LS_KEYS.PRODUK_CACHE, [])
          setProduk(cached.length > 0 ? cached : INITIAL_PRODUK)
        }
      })
      .catch(() => {
        const cached = readLS(LS_KEYS.PRODUK_CACHE, [])
        setProduk(cached.length > 0 ? cached : INITIAL_PRODUK)
      })

    supabase.from('transaksi').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) {
          const pendingLocalTrx = pendingTrxs.map(item => item.localRecord)
          setTrx([...pendingLocalTrx, ...data])
        } else if (error) {
          console.warn('Fetch transaksi gagal:', error.message)
        }
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

  // ── HELPER UPLOAD BUKTI TRANSFER ──
  const uploadBuktiFile = useCallback(async (file, idTransaksi) => {
    const ext = file.name?.split('.').pop() || 'jpg'
    const path = `bukti/${idTransaksi}-${Date.now()}.${ext}`
    const { error: errBucket } = await supabase.storage.from('bukti-transfer').upload(path, file, { upsert: true })
    if (!errBucket) {
      return supabase.storage.from('bukti-transfer').getPublicUrl(path)?.data?.publicUrl || null
    }
    const { error: errFallback } = await supabase.storage.from('produk-images').upload(path, file, { upsert: true })
    if (!errFallback) {
      return supabase.storage.from('produk-images').getPublicUrl(path)?.data?.publicUrl || null
    }
    return null
  }, [])

  // ── HELPER INSERT TRANSAKSI KE SUPABASE ──
  const pushTrxToSupabase = useCallback(async ({ baseData, userLabel, userId, buktiFile, cartItems }) => {
    const { count, error: countErr } = await supabase
      .from('transaksi')
      .select('*', { count: 'exact', head: true })
    if (countErr) {
      return { ok: false, error: countErr.message }
    }

    const nomorUrut = String((count || 0) + 1).padStart(2, '0')
    const idTransaksi = `TRX-${nomorUrut}`

    let buktiUrl = baseData.bukti || ''
    if (baseData.metode === 'transfer') {
      let fileToUpload = buktiFile
      if (!fileToUpload && buktiUrl.startsWith('data:image/')) {
        fileToUpload = dataUrlToFile(buktiUrl, `${idTransaksi}.jpg`)
      }
      if (fileToUpload) {
        const uploaded = await uploadBuktiFile(fileToUpload, idTransaksi)
        if (uploaded) buktiUrl = uploaded
      }
    }

    const cleanBase = {
      ...baseData,
      id: idTransaksi,
      bukti: buktiUrl,
    }
    const trxWithUser = { ...cleanBase, user: userLabel }

    let insertError = null
    const { error: firstErr } = await supabase.from('transaksi').insert([trxWithUser])
    if (firstErr) {
      if (firstErr.message?.includes('user') && !firstErr.message?.includes('user_id')) {
        const trxWithUserId = {
          ...cleanBase,
          ...(userId ? { user_id: userId } : {}),
        }
        const { error: secondErr } = await supabase.from('transaksi').insert([trxWithUserId])
        insertError = secondErr
      } else {
        insertError = firstErr
      }
    }

    if (insertError) {
      return { ok: false, error: insertError.message }
    }

    // Update stok di Supabase produk
    for (const ci of (cartItems || [])) {
      const { data: prodRow } = await supabase.from('produk').select('stok').eq('id', ci.id).single()
      if (prodRow) {
        const newStok = Math.max(0, prodRow.stok - ci.qty)
        await supabase.from('produk').update({ stok: newStok }).eq('id', ci.id)
      }
    }

    return { ok: true, data: trxWithUser }
  }, [uploadBuktiFile])

  // ── CHECKOUT & SIMPAN TRANSAKSI (ONLINE / OFFLINE QUEUE) ──
  const konfirmasi = useCallback(async (metode, bukti, buktiFile = null) => {
    const now = new Date()
    const tgl = now.toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const itemsPayload = cart.map(c => ({ nama: c.nama, qty: c.qty, h: c.harga, sat: c.sat }))
    const cartItems = cart.map(c => ({ id: c.id, qty: c.qty }))

    const baseData = {
      nama: cu ? cu.nama : 'Tamu',
      tgl: tgl + ', ' + jam,
      total: cartTotal,
      metode,
      bukti: metode === 'transfer' ? bukti : '',
      items: itemsPayload,
    }
    const userLabel = cu && !cu.isGuest ? cu.u : 'tamu'
    const userId = cu?.id || null

    const saveOfflineTrx = () => {
      const tempId = `TRX-LOKAL-${String(readLS(LS_KEYS.PENDING_TRX, []).length + 1).padStart(2, '0')}`
      const localRecord = { ...baseData, id: tempId, user: userLabel, isOfflinePending: true }
      const queue = readLS(LS_KEYS.PENDING_TRX, [])
      queue.push({ tempId, baseData, userLabel, userId, cartItems, localRecord })
      writeLS(LS_KEYS.PENDING_TRX, queue)
      refreshPendingCount()

      setTrx(prev => [localRecord, ...prev])
      setProduk(prev => prev.map(p => {
        const ci = cart.find(c => c.id === p.id)
        return ci ? { ...p, stok: Math.max(0, p.stok - ci.qty) } : p
      }))
      setCart([])
      return { ok: true, offline: true, data: localRecord }
    }

    // Jika sedang offline, langsung simpan ke database lokal
    if (!navigator.onLine) {
      return saveOfflineTrx()
    }

    // Jika online, coba kirim langsung ke Supabase
    try {
      const res = await pushTrxToSupabase({ baseData, userLabel, userId, buktiFile, cartItems })
      if (!res.ok) {
        if (isNetworkError(res.error)) {
          return saveOfflineTrx()
        }
        console.warn('Gagal menyimpan transaksi ke Supabase:', res.error)
        return { ok: false, error: res.error }
      }

      setTrx(prev => [res.data, ...prev])
      setProduk(prev => prev.map(p => {
        const ci = cart.find(c => c.id === p.id)
        return ci ? { ...p, stok: Math.max(0, p.stok - ci.qty) } : p
      }))
      setCart([])
      return { ok: true, data: res.data }
    } catch (err) {
      if (isNetworkError(err?.message)) {
        return saveOfflineTrx()
      }
      return { ok: false, error: err?.message || 'Gagal menyimpan transaksi' }
    }
  }, [cart, cartTotal, cu, pushTrxToSupabase, refreshPendingCount])

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

  // ── PRODUK ADMIN (ONLINE / OFFLINE QUEUE) ──
  const saveProduk = useCallback(async (data) => {
    const { id, imgFile, ...rest } = data
    const basePayload = {
      nama: rest.nama,
      kat: rest.kat,
      sat: rest.sat,
      hB: rest.hB,
      hJ: rest.hJ,
      stok: rest.stok,
      img: rest.img || '',
    }

    const saveOfflineProduk = () => {
      const isEdit = Boolean(id)
      const tempId = isEdit ? id : `OFF-${Date.now()}`
      const localRecord = { ...basePayload, id: tempId, isOfflinePending: true }
      const pendingImgDataUrl = imgFile && basePayload.img.startsWith('data:image/') ? basePayload.img : null

      const queue = readLS(LS_KEYS.PENDING_PRODUK, [])
      queue.push({
        action: isEdit ? 'update' : 'insert',
        id: isEdit ? id : null,
        tempId,
        payload: { ...basePayload, img: pendingImgDataUrl ? '' : basePayload.img },
        pendingImgDataUrl,
        localRecord,
      })
      writeLS(LS_KEYS.PENDING_PRODUK, queue)
      refreshPendingCount()

      if (isEdit) {
        setProduk(prev => prev.map(p => p.id === id ? { ...p, ...localRecord } : p))
      } else {
        setProduk(prev => [...prev, localRecord])
      }
      return { ok: true, offline: true, data: localRecord }
    }

    // Jika offline, tampung ke antrean localStorage terlebih dahulu
    if (!navigator.onLine) {
      return saveOfflineProduk()
    }

    let imgUrl = basePayload.img
    try {
      // 1. Upload foto ke Supabase Storage terlebih dahulu jika ada file baru
      if (imgFile) {
        const uploadedUrl = await uploadFoto(imgFile, id || 'new')
        if (!uploadedUrl) {
          if (!navigator.onLine) return saveOfflineProduk()
          return { ok: false, msg: 'Gagal upload foto ke Storage (produk-images). Cek policy bucket Supabase.' }
        }
        imgUrl = uploadedUrl
      }

      const payload = { ...basePayload, img: imgUrl }

      // 2. Simpan (.update / .insert) ke tabel produk Supabase
      if (id) {
        const { data: updated, error } = await supabase
          .from('produk')
          .update(payload)
          .eq('id', id)
          .select()
          .single()
        if (error) {
          if (isNetworkError(error.message)) return saveOfflineProduk()
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
          if (isNetworkError(error.message)) return saveOfflineProduk()
          console.warn('Insert produk ke Supabase gagal:', error.message)
          return { ok: false, msg: 'Gagal simpan produk: ' + error.message }
        }
        setProduk(prev => [...prev, inserted])
        return { ok: true, data: inserted }
      }
    } catch (err) {
      if (isNetworkError(err?.message)) return saveOfflineProduk()
      return { ok: false, msg: err?.message || 'Gagal menyimpan produk' }
    }
  }, [uploadFoto, refreshPendingCount])

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

  // ── SINKRONISASI OTOMATIS ANTREAN LOKAL SAAT KEMBALI ONLINE ──
  const syncOfflineData = useCallback(async () => {
    if (!navigator.onLine || isSyncingRef.current) return
    const pendingProds = readLS(LS_KEYS.PENDING_PRODUK, [])
    const pendingTrxs  = readLS(LS_KEYS.PENDING_TRX, [])
    if (pendingProds.length === 0 && pendingTrxs.length === 0) return

    isSyncingRef.current = true
    let syncedCount = 0

    try {
      // 1. Sinkronkan produk baru/edit dari antrean lokal ke Supabase
      const remainingProds = []
      for (const item of pendingProds) {
        if (!navigator.onLine) {
          remainingProds.push(item)
          continue
        }
        try {
          let payload = { ...item.payload }
          if (item.pendingImgDataUrl) {
            const imgFile = dataUrlToFile(item.pendingImgDataUrl, `produk-${Date.now()}.jpg`)
            if (imgFile) {
              const uploadedUrl = await uploadFoto(imgFile, item.id || 'new')
              if (uploadedUrl) payload.img = uploadedUrl
            }
          }

          if (item.action === 'update' && item.id) {
            const { data: updated, error } = await supabase
              .from('produk')
              .update(payload)
              .eq('id', item.id)
              .select()
              .single()
            if (error) {
              remainingProds.push(item)
            } else {
              syncedCount++
              setProduk(prev => prev.map(p => p.id === item.id ? (updated || { ...p, ...payload, isOfflinePending: false }) : p))
            }
          } else {
            const { data: inserted, error } = await supabase
              .from('produk')
              .insert(payload)
              .select()
              .single()
            if (error) {
              remainingProds.push(item)
            } else {
              syncedCount++
              setProduk(prev => prev.map(p => p.id === item.tempId ? inserted : p))
            }
          }
        } catch {
          remainingProds.push(item)
        }
      }
      writeLS(LS_KEYS.PENDING_PRODUK, remainingProds)

      // 2. Sinkronkan transaksi dari antrean lokal ke Supabase
      const remainingTrxs = []
      for (const item of pendingTrxs) {
        if (!navigator.onLine) {
          remainingTrxs.push(item)
          continue
        }
        try {
          const res = await pushTrxToSupabase({
            baseData: item.baseData,
            userLabel: item.userLabel,
            userId: item.userId,
            buktiFile: null,
            cartItems: item.cartItems,
          })
          if (!res.ok) {
            remainingTrxs.push(item)
          } else {
            syncedCount++
            setTrx(prev => prev.map(t => t.id === item.tempId ? res.data : t))
          }
        } catch {
          remainingTrxs.push(item)
        }
      }
      writeLS(LS_KEYS.PENDING_TRX, remainingTrxs)
      refreshPendingCount()

      if (syncedCount > 0 && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('wb-sync-complete', { detail: { syncedCount } }))
      }
    } finally {
      isSyncingRef.current = false
    }
  }, [uploadFoto, pushTrxToSupabase, refreshPendingCount])

  useEffect(() => {
    if (navigator.onLine) {
      syncOfflineData()
    }
    const handleOnline = () => {
      syncOfflineData()
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [syncOfflineData])

  const userTrx = cu ? trx.filter(t => t.user === cu.u) : []
  const kritis  = produk.filter(p => p.stok <= 5 && p.stok > 0)

  return {
    produk, trx, heroImg, users, cart, cu, rp,
    cartTotal, cartCount, userTrx, kritis,
    pendingSyncCount, syncOfflineData,
    addCart, ubahQty, delCart, clearCart,
    konfirmasi, uploadFoto, uploadBanner,
    saveProduk, delProduk, updateProdukImg,
    login, loginAdmin, loginGuest, logout,
    setProduk, setTrx,
  }
}
