import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/Toast'
import { Modal } from '../../components/Modal'
import { Struk } from '../../components/Struk'
import { Footer } from '../../components/Footer'

// ══ HELPERS ══
function spill(stok) {
  if (stok === 0) return <span className="stok-pill sp-out">Habis</span>
  if (stok <= 5)  return <span className="stok-pill sp-warn">Sisa {stok}</span>
  return <span className="stok-pill sp-ok">Tersedia</span>
}

function iph(p, size = 54) {
  return p.img
    ? <img src={p.img} alt={p.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
}

// ══ NAVBAR USER ══
function UserNav({ page, cartCount, onNav, onLogout, cu }) {
  const pages = ['beranda', 'produk', 'transaksi', 'tentang', 'profil']
  const userInitials = cu?.nama ? cu.nama.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'
  const userFirst = cu?.nama ? cu.nama.split(' ')[0] : 'User'

  return (
    <>
      <nav className="navbar">
        <button className="nb-logo btn-lift" onClick={() => onNav('beranda')}>
          <div className="nb-logo-mark">W</div>
          <div className="nb-logo-text">WaroengBude<small>Sembako Online</small></div>
        </button>
        <div className="nb-links">
          {pages.map(p => (
            <button key={p} className={`nbl nav-item-anim${page === p ? ' aktif' : ''}`} onClick={() => onNav(p)}>
              {p === 'tentang' ? 'Tentang Kami' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div className="nb-right">
          <button className="user-pill btn-lift" onClick={() => onNav('profil')} title="Lihat Profil">
            <div className="u-av" id="uAv">{userInitials}</div>
            <span id="uName">{userFirst}</span>
          </button>
          <button className="logout-btn btn-bounce" onClick={() => onLogout()}>Keluar</button>
        </div>
      </nav>
      <nav className="bottom-nav">
        {[
          { key: 'beranda', label: 'Beranda', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></> },
          { key: 'produk', label: 'Produk', icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></> },
          { key: 'transaksi', label: 'Transaksi', icon: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></> },
          { key: 'tentang', label: 'Tentang', icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></> },
          { key: 'profil', label: 'Profil', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
        ].map(item => (
          <button key={item.key} className={`bnav-item${page === item.key ? ' aktif' : ''}`} onClick={() => onNav(item.key)}>
            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{item.icon}</svg>
            {item.label}
          </button>
        ))}
      </nav>
    </>
  )
}

// ══ PRODUK CARD ══
function ProdukCard({ p, isSelected, onAdd, onDetail, onImgUpload }) {
  return (
    <div className={`produk-card card-anim${isSelected ? ' aktif-pilih' : ''}`} onClick={() => onDetail(p.id)}>
      <div className="p-img">
        {iph(p)}
        <label className="p-ul btn-bounce" htmlFor={`upd-${p.id}`} onClick={e => e.stopPropagation()}>
          <svg fill="none" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Foto
        </label>
        <input type="file" id={`upd-${p.id}`} accept="image/*" style={{ display: 'none' }} onChange={e => onImgUpload(e, p.id)} onClick={e => e.stopPropagation()} />
      </div>
      <div className="p-body">
        <div className="p-kat">{p.kat}</div>
        <div className="p-nama">{p.nama}</div>
        <div className="p-harga">{('Rp ' + Number(p.hJ).toLocaleString('id-ID'))}</div>
        <div className="p-foot">
          {spill(p.stok)}
          <button className="add-btn btn-bounce" disabled={p.stok === 0} onClick={e => { e.stopPropagation(); onAdd(p.id) }} title="Tambah ke Keranjang">
            <svg fill="none" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ══ USER APP ══
export function UserApp({ onLogout, onNavigateScreen }) {
  const { produk, trx, cart, cu, rp, cartCount, cartTotal, userTrx, kritis, addCart, ubahQty, delCart, clearCart, konfirmasi, updateProdukImg } = useApp()
  const toast = useToast()

  const [page, setPage]             = useState('beranda')
  const [detTrxId, setDetTrxId]     = useState(null)
  const [heroImg, setHeroImg]       = useState('')
  const [filterF, setFilterF]       = useState('Semua')
  const [search, setSearch]         = useState('')
  const [searchBeranda, setSearchBeranda] = useState('')
  const [searchTrx, setSearchTrx]   = useState('')
  const [searchTentang, setSearchTentang] = useState('')
  const [searchProfil, setSearchProfil]   = useState('')
  const [selectedProdId, setSelectedProdId] = useState(produk[0]?.id || 1)
  const [mobileTab, setMobileTab]   = useState('katalog') // 'katalog' | 'keranjang'
  const [modal, setModal]           = useState(false)
  const [metode, setMetode]         = useState('cash')
  const [bukti, setBukti]           = useState('')
  const [finalTrx, setFinalTrx]     = useState(null)

  const nav = (p) => { setPage(p); window.scrollTo(0, 0) }

  const handleImgUpload = async (e, id) => {
    const f = e.target.files[0]; if (!f) return
    await updateProdukImg(id, f)
    toast('Foto diperbarui & disimpan')
  }

  const handleAddCart = (id) => {
    const res = addCart(id)
    if (res) toast(res.msg)
  }

  const handleDetail = (id) => {
    setSelectedProdId(id)
    setPage('produk')
    window.scrollTo({ top: 80, behavior: 'smooth' })
  }

  const handleDetTrx = (id) => {
    setDetTrxId(id); nav('detail-trx')
  }

  // ── FILTER PRODUK ──
  const kats = ['Semua', ...new Set(produk.map(p => p.kat))]
  const filteredProduk = produk.filter(p => {
    const matchKat = filterF === 'Semua' || p.kat === filterF
    const q = search.toLowerCase()
    return matchKat && (p.nama.toLowerCase().includes(q) || p.kat.toLowerCase().includes(q))
  })

  // ── FILTER PRODUK BERANDA ──
  const filteredBerandaProduk = produk.filter(p => {
    if (!searchBeranda) return true
    const q = searchBeranda.toLowerCase()
    return p.nama.toLowerCase().includes(q) || p.kat.toLowerCase().includes(q)
  })

  // ── FILTER TRANSAKSI ──
  const filteredUserTrx = userTrx.filter(t => {
    if (!searchTrx) return true
    const q = searchTrx.toLowerCase()
    return (
      t.id.toLowerCase().includes(q) ||
      t.tgl.toLowerCase().includes(q) ||
      t.metode.toLowerCase().includes(q) ||
      t.items.some(i => i.nama.toLowerCase().includes(q))
    )
  })

  // ── CHECKOUT ──
  const handleKonfirmasi = async () => {
    if (metode === 'transfer' && !bukti) { toast('Upload bukti transfer terlebih dahulu'); return }
    const result = await konfirmasi(metode, bukti)
    if (result) {
      setFinalTrx(result)
      setMetode('cash'); setBukti('')
    }
  }

  const handleBuktiUpload = (e) => {
    const f = e.target.files[0]; if (!f) return
    if (f.size > 5 * 1024 * 1024) { toast('Ukuran max 5MB'); return }
    const r = new FileReader()
    r.onload = ev => { setBukti(ev.target.result); toast('Bukti berhasil diupload') }
    r.readAsDataURL(f)
  }

  const tutupModal = () => { setModal(false); setFinalTrx(null); nav('transaksi') }

  const activeProduk = produk.find(p => p.id === selectedProdId) || filteredProduk[0] || produk[0] || null
  const detTrx       = trx.find(t => t.id === detTrxId)

  return (
    <div className="app aktif" style={{ flexDirection: 'column' }}>
      <UserNav page={page} cartCount={cartCount} onNav={nav} onLogout={onLogout} cu={cu} />

      <div className="main">
        {/* ── BERANDA ── */}
        <div className={`page${page === 'beranda' ? ' aktif' : ''}`}>
          <div className="hero">
            <div className="hero-txt">
              <div className="hero-tag">Selamat Datang di WaroengBude</div>
              <h1>Solusi Terbaik untuk Kebutuhan Sembako</h1>
              <p>Belanja sembako lengkap — beras, minyak, gula, dan ribuan produk lainnya dengan harga terbaik.</p>
              <div className="hero-btns">
                <button className="btn-hw btn-bounce" onClick={() => nav('produk')}>Belanja Sekarang</button>
                <button className="btn-hs btn-lift" onClick={() => nav('tentang')}>Tentang Kami</button>
              </div>
            </div>
            <div className="hero-img">
              {heroImg ? <img src={heroImg} alt="Banner" /> : (
                <div className="hero-img-ph">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <p>Upload Banner</p>
                </div>
              )}
              <label className="hero-upload btn-lift" htmlFor="heroUpload">
                <svg fill="none" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Ganti
              </label>
              <input type="file" id="heroUpload" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setHeroImg(ev.target.result); r.readAsDataURL(f) }} />
            </div>
          </div>

          <div className="pc" style={{ paddingBottom: 0 }}>
            {/* Search Bar Beranda */}
            <div className="search-box">
              <svg fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                className="search-input"
                placeholder="Cari produk di Beranda (beras, minyak, telur, mie)..."
                value={searchBeranda}
                onChange={e => setSearchBeranda(e.target.value)}
              />
            </div>
          </div>

          <div className="stats-row">
            {[
              { cl: 'sc-a', val: produk.length, lbl: 'Total Produk', icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></> },
              { cl: 'sc-r', val: kritis.length, lbl: 'Stok Kritis',  icon: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></> },
              { cl: 'sc-b', val: userTrx.length, lbl: 'Transaksi Saya', icon: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></> },
              { cl: 'sc-g', val: cartCount,      lbl: 'Di Keranjang', icon: <><path d="M2 4h3l2.4 10.2a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 .96-.73L21 7H5.7"/><line x1="6.5" y1="11" x2="19.8" y2="11"/><circle cx="9" cy="19.5" r="1.5"/><circle cx="17.5" cy="19.5" r="1.5"/></> },
            ].map((s, i) => (
              <div key={i} className={`stat-card ${s.cl} card-anim`} onClick={() => s.lbl === 'Di Keranjang' ? nav('produk') : undefined} style={{ cursor: s.lbl === 'Di Keranjang' ? 'pointer' : 'default' }}>
                <div className="s-ic"><svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{s.icon}</svg></div>
                <div className="s-val">{s.val}</div>
                <div className="s-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>

          <div className="swrap">
            <div className="sec-head"><span className="sec-title">Stok Hampir Habis</span></div>
            {kritis.length ? kritis.slice(0, 3).map(p => (
              <div key={p.id} className="sk-item" onClick={() => handleDetail(p.id)} style={{ cursor: 'pointer' }}>
                <div className="sk-img">{iph(p, 40)}</div>
                <div><div className="sk-nama">{p.nama}</div><div className="sk-stok">Sisa {p.stok} {p.sat}</div></div>
                <span className="sk-pill">Kritis</span>
              </div>
            )) : <div style={{ textAlign: 'center', padding: 16, color: 'var(--S3)', fontSize: 13 }}>Semua stok aman</div>}

            <div className="sec-head" style={{ marginTop: 16 }}>
              <span className="sec-title">{searchBeranda ? `Hasil Pencarian ("${searchBeranda}")` : 'Produk Unggulan'}</span>
              <button className="sec-link btn-lift" onClick={() => { if (searchBeranda) setSearch(searchBeranda); nav('produk') }}>Lihat semua</button>
            </div>
            <div className="produk-grid">
              {(searchBeranda ? filteredBerandaProduk : produk.slice(-4)).map(p => (
                <ProdukCard
                  key={p.id}
                  p={p}
                  isSelected={selectedProdId === p.id}
                  onAdd={handleAddCart}
                  onDetail={handleDetail}
                  onImgUpload={handleImgUpload}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── PRODUK (DIGABUNGKAN DENGAN KERANJANG & DETAIL) ── */}
        <div className={`page${page === 'produk' ? ' aktif' : ''}`}>
          <div className="pc" style={{ maxWidth: 1180 }}>
            <div className="sec-head">
              <span className="sec-title">Belanja Sembako</span>
              <span style={{ fontSize: 12, color: 'var(--S4)', fontWeight: 600 }}>{filteredProduk.length} Produk Tersedia</span>
            </div>

            {/* Search Bar Produk */}
            <div className="search-box">
              <svg fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input className="search-input" placeholder="Cari nama produk atau kategori..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Mobile View Switcher */}
            <div className="pc-view-toggle">
              <button className={`pvt-btn${mobileTab === 'katalog' ? ' aktif' : ''}`} onClick={() => setMobileTab('katalog')}>
                <svg fill="none" stroke="currentColor" width="16" height="16" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Katalog Produk
              </button>
              <button className={`pvt-btn${mobileTab === 'keranjang' ? ' aktif' : ''}`} onClick={() => setMobileTab('keranjang')}>
                <svg fill="none" stroke="currentColor" width="16" height="16" viewBox="0 0 24 24"><path d="M2 4h3l2.4 10.2a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 .96-.73L21 7H5.7"/><circle cx="9" cy="19.5" r="1.5"/><circle cx="17.5" cy="19.5" r="1.5"/></svg>
                Keranjang {cartCount > 0 && <span className="pvt-badge">{cartCount}</span>}
              </button>
            </div>

            <div className="produk-layout">
              {/* Kolom Kiri: Katalog Produk */}
              <div className="produk-catalog-col" style={{ display: mobileTab === 'keranjang' ? 'none' : 'block' }}>
                <div className="filter-row" style={{ marginBottom: 12 }}>
                  {kats.map(k => (
                    <button key={k} className={`chip chip-anim${filterF === k ? ' aktif' : ''}`} onClick={() => setFilterF(k)}>{k}</button>
                  ))}
                </div>

                <div className="produk-grid">
                  {filteredProduk.length ? (
                    filteredProduk.map(p => (
                      <ProdukCard
                        key={p.id}
                        p={p}
                        isSelected={selectedProdId === p.id}
                        onAdd={handleAddCart}
                        onDetail={(id) => {
                          setSelectedProdId(id)
                          // Jika di mobile dan pengguna klik detail, beri kemudahan akses
                        }}
                        onImgUpload={handleImgUpload}
                      />
                    ))
                  ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--S3)' }}>Tidak ditemukan</div>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Detail Produk Terpilih & Keranjang Belanja */}
              <div className="produk-side-panel" style={{ display: mobileTab === 'katalog' ? undefined : 'flex' }}>
                {/* 1. Detail Barang yang Dipilih */}
                <div className="side-card">
                  <div className="side-card-title">
                    <span>Detail Barang</span>
                    {activeProduk && <span className="p-kat" style={{ margin: 0, textTransform: 'capitalize' }}>{activeProduk.kat}</span>}
                  </div>
                  {activeProduk ? (
                    <>
                      <div className="side-det-wrap">
                        <div className="side-det-img">{iph(activeProduk, 56)}</div>
                        <div className="side-det-info">
                          <div className="side-det-kat">{activeProduk.kat}</div>
                          <div className="side-det-nama" title={activeProduk.nama}>{activeProduk.nama}</div>
                          <div className="side-det-harga">{rp(activeProduk.hJ)} <small style={{ color: 'var(--S3)', fontWeight: 400 }}>/ {activeProduk.sat}</small></div>
                          <div style={{ marginTop: 4 }}>{spill(activeProduk.stok)}</div>
                        </div>
                      </div>
                      <button
                        className="btn btn-g btn-bounce"
                        style={{ width: '100%', padding: '10px 14px', fontSize: 13, fontWeight: 700 }}
                        disabled={activeProduk.stok === 0}
                        onClick={() => handleAddCart(activeProduk.id)}
                      >
                        {activeProduk.stok === 0 ? 'Stok Habis' : '+ Masukkan Keranjang'}
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px 8px', color: 'var(--S3)', fontSize: 12.5 }}>
                      Pilih produk di katalog untuk melihat detail barang di sini.
                    </div>
                  )}
                </div>

                {/* 2. Keranjang Belanja */}
                <div className="side-card">
                  <div className="side-card-title">
                    <span>Keranjang Belanja ({cartCount})</span>
                    {cart.length > 0 && (
                      <button
                        className="sec-link btn-lift"
                        style={{ color: 'var(--R)', fontSize: 12 }}
                        onClick={() => { clearCart(); toast('Keranjang dikosongkan') }}
                      >
                        Kosongkan
                      </button>
                    )}
                  </div>

                  {cart.length === 0 ? (
                    <div className="cart-empty" style={{ padding: '24px 12px' }}>
                      <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ width: 36, height: 36, margin: '0 auto 8px', display: 'block', stroke: 'var(--S3)' }}>
                        <path d="M2 4h3l2.4 10.2a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 .96-.73L21 7H5.7"/>
                        <line x1="6.5" y1="11" x2="19.8" y2="11"/>
                        <circle cx="9" cy="19.5" r="1.5"/>
                        <circle cx="17.5" cy="19.5" r="1.5"/>
                      </svg>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--T2)' }}>Keranjang kosong</p>
                      <small style={{ color: 'var(--S3)' }}>Pilih produk di katalog untuk belanja</small>
                    </div>
                  ) : (
                    <>
                      <div className="side-cart-list">
                        {cart.map(c => (
                          <div key={c.id} className="cart-item" style={{ padding: '8px 10px', gap: 10, margin: 0, borderRadius: 'var(--rs)' }}>
                            <div className="ci-img" style={{ width: 44, height: 44, flexShrink: 0 }}>
                              {c.img ? <img src={c.img} alt={c.nama} /> : <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                            </div>
                            <div className="ci-info">
                              <div className="ci-nama" style={{ fontSize: 12.5 }}>{c.nama}</div>
                              <div className="ci-harga" style={{ fontSize: 11.5 }}>{rp(c.harga)} / {c.sat}</div>
                              <div className="qty-wrap" style={{ marginTop: 4 }}>
                                <button className="qty-btn btn-bounce" onClick={() => ubahQty(c.id, -1)}>-</button>
                                <span className="qty-num" style={{ fontSize: 12, minWidth: 20 }}>{c.qty}</span>
                                <button className="qty-btn btn-bounce" onClick={() => ubahQty(c.id, 1)}>+</button>
                              </div>
                            </div>
                            <button className="ci-del btn-bounce" onClick={() => { delCart(c.id); toast('Dihapus') }} title="Hapus">
                              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="cart-summary" style={{ marginTop: 8, padding: 12, borderRadius: 'var(--rs)' }}>
                        <div className="sum-row" style={{ fontSize: 12 }}><span>Subtotal ({cart.length} produk)</span><span>{rp(cartTotal)}</span></div>
                        <div className="sum-row" style={{ fontSize: 12 }}><span>Biaya Layanan</span><span>Rp 0</span></div>
                        <div className="sum-total" style={{ fontSize: 14, marginTop: 6, paddingTop: 6 }}>
                          <span>Total</span>
                          <span style={{ color: 'var(--G1)' }}>{rp(cartTotal)}</span>
                        </div>
                        <button className="btn-bayar btn-bounce" style={{ marginTop: 10, padding: 11, fontSize: 13 }} onClick={() => setModal(true)}>
                          Bayar Sekarang · {rp(cartTotal)}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TRANSAKSI ── */}
        <div className={`page${page === 'transaksi' ? ' aktif' : ''}`}>
          <div className="pc">
            <div className="sec-head"><span className="sec-title">Riwayat Transaksi</span></div>

            {/* Search Bar Transaksi */}
            <div className="search-box">
              <svg fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                className="search-input"
                placeholder="Cari transaksi (Kode TRX, tanggal, nama barang, metode)..."
                value={searchTrx}
                onChange={e => setSearchTrx(e.target.value)}
              />
            </div>

            {filteredUserTrx.length === 0
              ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--S3)' }}>{searchTrx ? 'Transaksi tidak ditemukan' : 'Belum ada transaksi'}</div>
              : filteredUserTrx.map(t => (
                  <div key={t.id} className="trx-card card-anim" onClick={() => handleDetTrx(t.id)}>
                    <div>
                      <div className="trx-id">{t.id}</div>
                      <div className="trx-tgl">{t.tgl}</div>
                      <span className="trx-status">Selesai</span>
                    </div>
                    <div>
                      <div className="trx-total">{rp(t.total)}</div>
                      <div className="trx-cnt">{t.items.length} item</div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>

        {/* ── TENTANG KAMI ── */}
        <div className={`page${page === 'tentang' ? ' aktif' : ''}`}>
          <div className="about-page-wrap">
            <div className="about-content-box">
              <h2 className="about-main-title">Tentang Kami</h2>

              {/* Search Bar Tentang */}
              <div className="search-box" style={{ marginBottom: 18 }}>
                <svg fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  className="search-input"
                  placeholder="Cari info tentang toko, alamat, atau kontak..."
                  value={searchTentang}
                  onChange={e => setSearchTentang(e.target.value)}
                />
              </div>

              <div className="about-desc-block">
                <p>Toko Berkat Jaya adalah sebuah usaha retail yang secara khusus fokus pada penjualan sembako, singkatan dari sembilan bahan pokok, seperti beras, gula, minyak, tepung, dan produk pangan lainnya.</p>
                <p>Berkat Jaya telah menjadi pilihan utama bagi masyarakat yang mencari solusi praktis untuk memenuhi kebutuhan dapur mereka dengan jangkauan produk yang lengkap dan pelayanan yang ramah.</p>
              </div>

              <div className="about-info-cards">
                <div className="about-info-card" id="lokasi-toko">
                  <div className="aic-ico"><svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                  <div>
                    <div className="aic-title">Alamat &amp; Lokasi</div>
                    <div className="aic-sub">Jl. Tambak Rejo 59, Surabaya</div>
                    <div className="aic-sub">Cabang: Jl. Tambak Rejo I No. 25</div>
                    <div className="aic-tag">SURABAYA</div>
                  </div>
                </div>
                <div className="about-info-card">
                  <div className="aic-ico"><svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.42 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.85a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16l.19.92z"/></svg></div>
                  <div>
                    <div className="aic-title">Kontak Resmi</div>
                    <div className="aic-sub">Telp / WhatsApp</div>
                    <div className="aic-sub" style={{ fontWeight: 600, color: 'var(--G1)' }}>0813-3119-2564</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PROFIL ── */}
        <div className={`page${page === 'profil' ? ' aktif' : ''}`}>
          <div className="pc" style={{ maxWidth: 640 }}>
            <div className="sec-head"><span className="sec-title">Profil Akun</span></div>

            {/* Search Bar Profil */}
            <div className="search-box">
              <svg fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                className="search-input"
                placeholder="Cari info profil atau riwayat akun..."
                value={searchProfil}
                onChange={e => setSearchProfil(e.target.value)}
              />
            </div>

            {/* KONDISI AKUN: TAMU vs TERDAFTAR */}
            {cu && cu.isGuest ? (
              <div className="guest-card">
                <div className="guest-icon">
                  <svg viewBox="0 0 24 24" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <h3 className="guest-title">Akun Tamu</h3>
                <p className="guest-desc">
                  Hanya akun tamu, jika ingin melihat keterangan halaman profil maka bisa daftar akun terlebih dahulu.
                </p>
                <div className="guest-actions">
                  <button
                    className="btn btn-g btn-bounce"
                    style={{ padding: '11px 20px', fontWeight: 700 }}
                    onClick={() => onNavigateScreen ? onNavigateScreen('register') : onLogout('register')}
                  >
                    Daftar Akun Sekarang
                  </button>
                  <button
                    className="btn btn-hs btn-lift"
                    style={{ padding: '11px 20px', fontWeight: 700 }}
                    onClick={() => onNavigateScreen ? onNavigateScreen('login') : onLogout('login')}
                  >
                    Masuk ke Akun
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-card">
                <div className="profile-header">
                  <div className="u-av-lg">
                    {cu?.nama ? cu.nama.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'US'}
                  </div>
                  <div className="profile-names">
                    <h3>{cu?.nama || 'Pengguna'}</h3>
                    <p>@{cu?.u || 'user'}</p>
                    <span className="profile-role-badge">
                      <svg fill="none" stroke="currentColor" width="12" height="12" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      {cu?.role === 'admin' ? 'Administrator' : 'Pelanggan Terdaftar'}
                    </span>
                  </div>
                </div>

                <div className="profile-info-grid">
                  <div className="pi-item">
                    <div className="pi-label">Nama Lengkap</div>
                    <div className="pi-value">{cu?.nama || '-'}</div>
                  </div>
                  <div className="pi-item">
                    <div className="pi-label">Username</div>
                    <div className="pi-value">{cu?.u || '-'}</div>
                  </div>
                  <div className="pi-item">
                    <div className="pi-label">Status Akun</div>
                    <div className="pi-value" style={{ color: 'var(--G1)' }}>Aktif Terdaftar</div>
                  </div>
                  <div className="pi-item">
                    <div className="pi-label">Total Transaksi</div>
                    <div className="pi-value">{userTrx.length} Transaksi Selesai</div>
                  </div>
                </div>

                <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-hs btn-lift" style={{ flex: 1, padding: 11 }} onClick={() => nav('transaksi')}>
                    Lihat Transaksi
                  </button>
                  <button className="btn btn-r btn-bounce" style={{ flex: 1, padding: 11 }} onClick={() => onLogout()}>
                    Keluar Akun
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── DETAIL TRX ── */}
        <div className={`page${page === 'detail-trx' ? ' aktif' : ''}`}>
          <div className="pc">
            <button className="back-btn btn-lift" onClick={() => nav('transaksi')}>
              <svg fill="none" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>Kembali
            </button>
            {detTrx && (
              <>
                <div className="tbl-wrap" style={{ marginBottom: 12 }}>
                  {detTrx.items.map((i, idx) => (
                    <div key={idx} className="tdi">
                      <span>{i.nama} x{i.qty}</span>
                      <span style={{ fontWeight: 700 }}>{rp(i.qty * i.h)}</span>
                    </div>
                  ))}
                </div>
                <div className="cart-summary">
                  <div className="sum-row"><span>ID Transaksi</span><span style={{ fontWeight: 700 }}>{detTrx.id}</span></div>
                  <div className="sum-row"><span>Tanggal</span><span style={{ fontWeight: 600 }}>{detTrx.tgl}</span></div>
                  <div className="sum-row"><span>Metode Bayar</span><span style={{ fontWeight: 600 }}>{detTrx.metode === 'transfer' ? 'Transfer Bank' : 'Tunai (Cash)'}</span></div>
                  <div className="sum-total"><span>Total</span><span style={{ color: 'var(--G1)' }}>{rp(detTrx.total)}</span></div>
                </div>
                <div className="struk-actions" style={{ marginTop: 14 }}>
                  <button className="btn-print btn-bounce" onClick={() => {
                    document.getElementById('print-area').innerHTML = ''
                    const pa = document.getElementById('print-area')
                    pa.innerHTML = `<div style="font-family:sans-serif;padding:24px;max-width:360px;margin:auto"><h2 style="color:#1A7A3C">${detTrx.id}</h2><p>${detTrx.tgl}</p></div>`
                    pa.style.display = 'block'; window.print(); setTimeout(() => pa.style.display = 'none', 1000)
                  }}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    Cetak Struk
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER USER */}
      <Footer onNav={nav} isAdmin={false} />

      {/* ── MODAL CHECKOUT ── */}
      <Modal show={modal} onClose={() => setModal(false)}>
        {finalTrx ? (
          <Struk trx={finalTrx} rp={rp} onSelesai={tutupModal} />
        ) : (
          <>
            <div className="modal-title">Konfirmasi Pembayaran</div>
            <div className="tbl-wrap" style={{ marginBottom: 14 }}>
              {cart.map((c, i) => (
                <div key={i} className="tdi">
                  <span>{c.nama} x{c.qty} ({c.sat})</span>
                  <span style={{ fontWeight: 700 }}>{rp(c.harga * c.qty)}</span>
                </div>
              ))}
            </div>
            <div className="sum-total" style={{ marginBottom: 16 }}>
              <span>Total Pembayaran</span>
              <span style={{ color: 'var(--G1)', fontSize: 17 }}>{rp(cartTotal)}</span>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--T2)', marginBottom: 8 }}>Metode Pembayaran</div>
            <div className="pay-method-row">
              <button className={`pay-method-btn${metode === 'cash' ? ' aktif' : ''}`} onClick={() => setMetode('cash')}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"/><path d="M6 12h.01M18 12h.01"/></svg>
                <div className="pm-label">Tunai (Cash)</div><div className="pm-sub">Bayar langsung di kasir</div>
              </button>
              <button className={`pay-method-btn${metode === 'transfer' ? ' aktif' : ''}`} onClick={() => setMetode('transfer')}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                <div className="pm-label">Transfer Bank</div><div className="pm-sub">BCA / BRI / Mandiri</div>
              </button>
            </div>
            {metode === 'transfer' && (
              <div className="transfer-box show">
                <div className="transfer-box-title">Informasi Rekening Tujuan</div>
                <div className="rek-list">
                  {[{ bank: 'Bank BCA', num: '1234 5678 90' }, { bank: 'Bank BRI', num: '0098 7654 3210' }].map((r, i) => (
                    <div key={i} className="rek-info">
                      <div><div className="rek-bank">{r.bank}</div><div className="rek-num">{r.num}</div><div className="rek-name">a.n. Berkat Jaya</div></div>
                      <button className="rek-copy-btn" onClick={() => {
                        try { const ta = document.createElement('textarea'); ta.value = r.bank + ' · ' + r.num; ta.style.cssText = 'position:fixed;top:-9999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast('Nomor rekening disalin!') } catch {}
                      }}>Salin</button>
                    </div>
                  ))}
                </div>
                <div className="bukti-label">Upload Bukti Transfer</div>
                {!bukti ? (
                  <label className="bukti-upload-area btn-lift" htmlFor="buktiInput">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <p>Ketuk untuk upload bukti transfer</p><small>JPG, PNG, max 5MB</small>
                  </label>
                ) : (
                  <div className="bukti-prev-wrap show">
                    <img src={bukti} alt="Bukti Transfer" />
                    <button className="bukti-ubah" onClick={() => setBukti('')}>Ubah</button>
                  </div>
                )}
                <input type="file" id="buktiInput" accept="image/*" style={{ display: 'none' }} onChange={handleBuktiUpload} />
                <div className="transfer-note">Transfer nominal tepat sesuai total.</div>
              </div>
            )}
            <button className="btn-bayar btn-bounce" style={{ marginBottom: 8 }} onClick={handleKonfirmasi}>Konfirmasi Pembayaran</button>
            <button className="btn btn-r btn-bounce" style={{ width: '100%', padding: 11 }} onClick={() => setModal(false)}>Batal</button>
          </>
        )}
      </Modal>

      <div id="print-area" style={{ display: 'none' }} />
    </div>
  )
}
