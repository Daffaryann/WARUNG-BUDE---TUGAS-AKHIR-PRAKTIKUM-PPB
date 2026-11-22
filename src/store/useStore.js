import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── DATA AWAL (fallback jika Supabase belum terisi / offline) ──
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
  const [produk, setProduk]   = useState([])
  const [trx, setTrx]         = useState(INITIAL_TRX)
  const [users, setUsers]     = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('waroengbude_registered_users') || '[]')
      return [...INITIAL_USERS, ...saved]
    } catch {
      return INITIAL_USERS
    }
  })
  const [cart, setCart]       = useState([])
  const [cu, setCu]           = useState(null)   // current user

  // Simpan akun baru ke persistent list lokal agar bisa login langsung
  const saveRegisteredUser = useCallback((newUser) => {
    setUsers(prev => {
      const updated = [...prev.filter(x => x.u !== newUser.u), newUser]
      try {
        const saved = JSON.parse(localStorage.getItem('waroengbude_registered_users') || '[]')
        localStorage.setItem('waroengbude_registered_users', JSON.stringify([...saved.filter(x => x.u !== newUser.u), newUser]))
      } catch {}
      return updated
    })
  }, [])

  // ── FETCH PRODUK DARI SUPABASE (DENGAN LOCALSTORAGE MERGE PERSISTENCE) ──
  useEffect(() => {
    supabase.from('produk').select('*').order('id')
      .then(({ data, error }) => {
        const customImgs = (() => {
          try { return JSON.parse(localStorage.getItem('waroengbude_custom_imgs') || '{}') } catch { return {} }
        })()
        let baseList = (data && data.length > 0) ? data : INITIAL_PRODUK
        const merged = baseList.map(p => customImgs[p.id] ? { ...p, img: customImgs[p.id] } : p)
        setProduk(merged)
      })
      .catch(() => {
        const customImgs = (() => {
          try { return JSON.parse(localStorage.getItem('waroengbude_custom_imgs') || '{}') } catch { return {} }
        })()
        const merged = INITIAL_PRODUK.map(p => customImgs[p.id] ? { ...p, img: customImgs[p.id] } : p)
        setProduk(merged)
      })
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
        if (ci.qty >= p.stok) return prev
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
  const konfirmasi = useCallback(async (metode, bukti) => {
    const now = new Date()
    const tgl = now.toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const id = 'TRX-' + String(_nId++).padStart(4, '0')
    const total = cartTotal
    const trxData = {
      id,
      user: cu && !cu.isGuest ? cu.u : 'tamu',
      nama: cu ? cu.nama : 'Tamu',
      tgl: tgl + ', ' + jam,
      total,
      metode,
      bukti: metode === 'transfer' ? bukti : '',
      items: cart.map(c => ({ nama: c.nama, qty: c.qty, h: c.harga, sat: c.sat }))
    }

    try {
      const { error } = await supabase.from('transaksi').insert(trxData)
      if (error) {
        console.warn('Supabase transaksi insert:', error.message)
      }
    } catch (err) {
      console.warn('Supabase insert error:', err)
    }

    if (cu && !cu.isGuest) {
      setTrx(prev => [trxData, ...prev])
    }
    setProduk(prev => prev.map(p => {
      const ci = cart.find(c => c.id === p.id)
      return ci ? { ...p, stok: p.stok - ci.qty } : p
    }))
    setCart([])
    return trxData
  }, [cart, cartTotal, cu])

  // ── UPLOAD FOTO KE SUPABASE STORAGE ──
  const uploadFoto = useCallback(async (file, produkId) => {
    try {
      const ext = file.name ? file.name.split('.').pop() : 'png'
      const path = `produk/${produkId}-${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('produk-images')
        .upload(path, file, { upsert: true })
      if (error) {
        console.warn('Storage upload error:', error.message)
        return null
      }
      const { data: url } = supabase.storage.from('produk-images').getPublicUrl(path)
      return url?.publicUrl || null
    } catch {
      return null
    }
  }, [])

  // ── UPDATE FOTO PRODUK (PERSISTENT CLOUD + LOCAL CACHE) ──
  const updateProdukImg = useCallback(async (id, imgOrFile) => {
    let finalUrl = ''
    if (typeof imgOrFile === 'string') {
      finalUrl = imgOrFile
    } else if (imgOrFile instanceof File || imgOrFile instanceof Blob) {
      const cloudUrl = await uploadFoto(imgOrFile, id)
      if (cloudUrl) {
        finalUrl = cloudUrl
      } else {
        finalUrl = await new Promise((res) => {
          const r = new FileReader()
          r.onload = ev => res(ev.target.result)
          r.readAsDataURL(imgOrFile)
        })
      }
    }

    if (!finalUrl) return

    // Update state
    setProduk(prev => prev.map(p => p.id === id ? { ...p, img: finalUrl } : p))

    // Simpan ke Supabase Database
    try {
      await supabase.from('produk').update({ img: finalUrl }).eq('id', id)
    } catch {}

    // Simpan ke cache persistent localStorage agar tidak hilang saat reload/relog
    try {
      const customImgs = JSON.parse(localStorage.getItem('waroengbude_custom_imgs') || '{}')
      customImgs[id] = finalUrl
      localStorage.setItem('waroengbude_custom_imgs', JSON.stringify(customImgs))
    } catch {}

    return finalUrl
  }, [uploadFoto])

  // ── PRODUK ADMIN ──
  const saveProduk = useCallback(async (data) => {
    if (data.id) {
      setProduk(prev => prev.map(p => p.id === data.id ? { ...p, ...data } : p))
      try {
        await supabase.from('produk').update(data).eq('id', data.id)
      } catch {}
    } else {
      const newId = _nId++
      const newProd = { ...data, id: newId }
      setProduk(prev => [...prev, newProd])
      try {
        await supabase.from('produk').insert(newProd)
      } catch {}
    }
  }, [])

  const delProduk = useCallback(async (id) => {
    setProduk(prev => prev.filter(p => p.id !== id))
    try {
      await supabase.from('produk').delete().eq('id', id)
    } catch {}
  }, [])

  // ── AUTH ──
  const login = useCallback((u, p) => {
    const f = users.find(x => (x.u === u || x.u?.toLowerCase() === u?.toLowerCase()) && x.p === p)
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
    produk, trx, users, cart, cu, rp,
    cartTotal, cartCount, userTrx, kritis,
    addCart, ubahQty, delCart, clearCart,
    konfirmasi, uploadFoto, updateProdukImg,
    saveProduk, delProduk, saveRegisteredUser,
    login, loginAdmin, loginGuest, logout,
    setProduk, setTrx,
  }
}
