import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/Toast'
import { Struk } from '../../components/Struk'
import { Footer } from '../../components/Footer'

function iph(p) {
  return p.img
    ? <img src={p.img} alt={p.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={18} height={18}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
}

export function AdminApp({ onLogout }) {
  const { produk, trx, cu, rp, saveProduk, delProduk } = useApp()
  const toast = useToast()

  const [page, setPage]             = useState('dashboard')
  const [detTrxId, setDetTrxId]     = useState(null)
  const [editId, setEditId]         = useState(null)
  const [showStruk, setShowStruk]   = useState(null)

  // Search states for Admin pages
  const [searchDash, setSearchDash]       = useState('')
  const [searchProduk, setSearchProduk]   = useState('')
  const [searchTrx, setSearchTrx]         = useState('')
  const [searchTentang, setSearchTentang] = useState('')

  // Form state
  const emptyForm = { nama: '', kat: 'Makanan', sat: 'buah', hB: '', hJ: '', stok: '', img: '' }
  const [form, setForm] = useState(emptyForm)
  const kats = ['Makanan', 'Minuman', 'Kebersihan', 'Bumbu Dapur', 'Alat Tulis', 'Lainnya']

  const nav = (p) => { setPage(p); window.scrollTo(0, 0) }

  const kritis = produk.filter(p => p.stok <= 5 && p.stok > 0)
  const totalRevenue = trx.reduce((a, t) => a + t.total, 0)
  const detTrx = trx.find(t => t.id === detTrxId)

  // Filtered lists for Admin
  const filteredKritis = kritis.filter(p => {
    if (!searchDash) return true
    const q = searchDash.toLowerCase()
    return p.nama.toLowerCase().includes(q) || p.kat.toLowerCase().includes(q)
  })

  const filteredRecentTrx = trx.filter(t => {
    if (!searchDash) return true
    const q = searchDash.toLowerCase()
    return t.id.toLowerCase().includes(q) || t.user.toLowerCase().includes(q)
  })

  const filteredAdminProduk = produk.filter(p => {
    if (!searchProduk) return true
    const q = searchProduk.toLowerCase()
    return p.nama.toLowerCase().includes(q) || p.kat.toLowerCase().includes(q) || p.sat.toLowerCase().includes(q)
  })

  const filteredAdminTrx = trx.filter(t => {
    if (!searchTrx) return true
    const q = searchTrx.toLowerCase()
    return (
      t.id.toLowerCase().includes(q) ||
      t.user.toLowerCase().includes(q) ||
      t.metode.toLowerCase().includes(q) ||
      t.tgl.toLowerCase().includes(q) ||
      String(t.total).includes(q)
    )
  })

  const handleSave = () => {
    if (!form.nama || !form.kat || !form.sat) { toast('Lengkapi semua field!'); return }
    saveProduk({ ...form, id: editId || undefined, hB: parseInt(form.hB) || 0, hJ: parseInt(form.hJ) || 0, stok: parseInt(form.stok) || 0 })
    toast(editId ? 'Produk diperbarui!' : form.nama + ' ditambahkan!')
    setForm(emptyForm); setEditId(null); nav('produk')
  }

  const handleEdit = (p) => {
    setForm({ nama: p.nama, kat: p.kat, sat: p.sat, hB: p.hB, hJ: p.hJ, stok: p.stok, img: p.img || '' })
    setEditId(p.id); nav('tambah')
  }

  const handleDel = (id) => {
    if (!window.confirm('Hapus produk ini?')) return
    delProduk(id); toast('Produk dihapus'); nav('produk')
  }

  const handleFoto = (e) => {
    const f = e.target.files[0]; if (!f) return
    const r = new FileReader()
    r.onload = ev => setForm(prev => ({ ...prev, img: ev.target.result }))
    r.readAsDataURL(f)
  }

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></> },
    { key: 'produk',    label: 'Produk',    icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></> },
    { key: 'transaksi', label: 'Transaksi', icon: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></> },
    { key: 'tentang',   label: 'Tentang',   icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></> },
  ]

  return (
    <div className="app aktif" style={{ flexDirection: 'column' }}>
      {/* ── NAVBAR ADMIN ── */}
      <nav className="navbar">
        <button className="nb-logo btn-lift" onClick={() => nav('dashboard')}>
          <div className="nb-logo-mark">W</div>
          <div className="nb-logo-text">WaroengBude<small>Admin Panel</small></div>
        </button>
        <div className="nb-links">
          {navItems.map(item => (
            <button key={item.key} className={`nbl nav-item-anim${page === item.key ? ' aktif' : ''}`} onClick={() => nav(item.key)}>{item.label}</button>
          ))}
        </div>
        <div className="nb-right">
          <button className="user-pill btn-lift">
            <div className="u-av">{cu?.nama?.slice(0, 2).toUpperCase() || 'AD'}</div>
            <span>{cu?.nama?.split(' ')[0] || 'Admin'}</span>
          </button>
          <button className="logout-btn btn-bounce" onClick={onLogout}>Keluar</button>
        </div>
      </nav>

      <div className="main">
        {/* ── DASHBOARD ── */}
        <div className={`page${page === 'dashboard' ? ' aktif' : ''}`}>
          <div className="admin-banner">
            <h2 id="aGreet">Selamat datang, {cu?.nama || 'Admin'}</h2>
            <p>Kelola produk dan transaksi WaroengBude</p>
            <div className="a-badge">
              <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Admin
            </div>
          </div>
          <div className="pc">
            {/* Search Bar Dashboard */}
            <div className="search-box" style={{ marginBottom: 16 }}>
              <svg fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                className="search-input"
                placeholder="Cari cepat stok kritis atau transaksi di dashboard..."
                value={searchDash}
                onChange={e => setSearchDash(e.target.value)}
              />
            </div>

            <div className="stats-row" style={{ padding: 0, marginBottom: 16 }}>
              {[
                { label: 'Total Produk', val: produk.length, cl: 'sc-a', icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></> },
                { label: 'Transaksi', val: trx.length, cl: 'sc-b', icon: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/></> },
                { label: 'Stok Kritis', val: kritis.length, cl: 'sc-r', icon: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></> },
                { label: 'Total Revenue', val: rp(totalRevenue), cl: 'sc-g', icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>, isStr: true },
              ].map((s, i) => (
                <div key={i} className={`stat-card ${s.cl} card-anim`}>
                  <div className="s-ic"><svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{s.icon}</svg></div>
                  <div className="s-val" style={s.isStr ? { fontSize: 16 } : {}}>{s.val}</div>
                  <div className="s-lbl">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Stok Kritis */}
            {filteredKritis.length > 0 && (
              <>
                <div className="sec-head"><span className="sec-title">Stok Kritis</span></div>
                {filteredKritis.map(p => (
                  <div key={p.id} className="sk-item">
                    <div className="sk-img">{iph(p)}</div>
                    <div><div className="sk-nama">{p.nama}</div><div className="sk-stok">Sisa {p.stok} {p.sat}</div></div>
                    <span className="sk-pill">Kritis</span>
                  </div>
                ))}
              </>
            )}

            {/* Transaksi terbaru */}
            <div className="sec-head" style={{ marginTop: 16 }}>
              <span className="sec-title">Transaksi Terbaru</span>
              <button className="sec-link btn-lift" onClick={() => nav('transaksi')}>Lihat semua</button>
            </div>
            <div className="tbl-wrap">
              {filteredRecentTrx.slice(0, 5).map(t => (
                <div key={t.id} className="trxm-item" onClick={() => { setDetTrxId(t.id); nav('detail-trx') }}>
                  <div><div style={{ fontWeight: 700, color: 'var(--T)' }}>{t.id}</div><div style={{ fontSize: 11, color: 'var(--S3)' }}>{t.user} · {t.tgl}</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 700, color: 'var(--G1)' }}>{rp(t.total)}</div><div style={{ fontSize: 10, color: 'var(--S3)' }}>{t.metode === 'transfer' ? 'Transfer' : 'Cash'}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── KELOLA PRODUK ── */}
        <div className={`page${page === 'produk' ? ' aktif' : ''}`}>
          <div className="pc">
            <div className="sec-head">
              <span className="sec-title">Kelola Produk</span>
              <button className="btn btn-g btn-bounce" style={{ padding: '8px 16px', flex: 'none' }} onClick={() => { setForm(emptyForm); setEditId(null); nav('tambah') }}>+ Tambah</button>
            </div>

            {/* Search Bar Kelola Produk */}
            <div className="search-box" style={{ marginBottom: 14 }}>
              <svg fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                className="search-input"
                placeholder="Cari produk berdasarkan nama, kategori, atau satuan..."
                value={searchProduk}
                onChange={e => setSearchProduk(e.target.value)}
              />
            </div>

            <div className="admin-tabs">
              <button className="a-tab aktif">Semua ({filteredAdminProduk.length})</button>
            </div>

            <div className="tbl-wrap tp">
              <div className="tbl-h"><span>Produk</span><span>Kategori</span><span>Harga Jual</span><span>Stok</span><span>Aksi</span></div>
              {filteredAdminProduk.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--S3)' }}>Tidak ada produk yang cocok</div>
              ) : (
                filteredAdminProduk.map(p => (
                  <div key={p.id} className="tbl-r">
                    <span className="tc" style={{ fontWeight: 600 }}>{p.nama}</span>
                    <span className="tc">{p.kat}</span>
                    <span className="tc" style={{ color: 'var(--G1)', fontWeight: 700 }}>{rp(p.hJ)}</span>
                    <span className="tc" style={{ color: p.stok <= 5 ? 'var(--R)' : 'var(--T)' }}>{p.stok} {p.sat}</span>
                    <span className="cell-acts">
                      <button className="act-e" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="act-d" onClick={() => handleDel(p.id)}>Hapus</button>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── FORM TAMBAH/EDIT ── */}
        <div className={`page${page === 'tambah' ? ' aktif' : ''}`}>
          <div className="pc">
            <button className="back-btn btn-lift" onClick={() => nav('produk')}>
              <svg fill="none" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>Kembali
            </button>
            <div className="form-card">
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--T)', marginBottom: 16 }}>{editId ? 'Edit Produk' : 'Tambah Produk Baru'}</div>
              <div className="form-group">
                <label className="form-label">Nama Produk</label>
                <input className="form-input" value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} placeholder="Nama produk" />
              </div>
              <div className="g2">
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select className="f-select" value={form.kat} onChange={e => setForm(p => ({ ...p, kat: e.target.value }))}>
                    {kats.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Satuan</label>
                  <input className="form-input" value={form.sat} onChange={e => setForm(p => ({ ...p, sat: e.target.value }))} placeholder="buah, kg, bungkus..." />
                </div>
              </div>
              <div className="g2">
                <div className="form-group">
                  <label className="form-label">Harga Beli (Rp)</label>
                  <input className="form-input" type="number" value={form.hB} onChange={e => setForm(p => ({ ...p, hB: e.target.value }))} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Harga Jual (Rp)</label>
                  <input className="form-input" type="number" value={form.hJ} onChange={e => setForm(p => ({ ...p, hJ: e.target.value }))} placeholder="0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Stok Awal</label>
                <input className="form-input" type="number" value={form.stok} onChange={e => setForm(p => ({ ...p, stok: e.target.value }))} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Foto Produk</label>
                {form.img
                  ? <div style={{ position: 'relative' }}>
                      <img src={form.img} className="foto-prev show" alt="Preview" />
                      <button className="bukti-ubah" onClick={() => setForm(p => ({ ...p, img: '' }))}>Ubah</button>
                    </div>
                  : <label className="foto-area btn-lift" htmlFor="aFotoInput">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <p>Upload foto produk</p><small>JPG, PNG, max 5MB</small>
                    </label>
                }
                <input type="file" id="aFotoInput" accept="image/*" style={{ display: 'none' }} onChange={handleFoto} />
              </div>
              <button className="btn btn-g btn-bounce" style={{ width: '100%', padding: 13 }} onClick={handleSave}>
                {editId ? 'Simpan Perubahan' : 'Simpan Produk'}
              </button>
            </div>
          </div>
        </div>

        {/* ── TRANSAKSI ── */}
        <div className={`page${page === 'transaksi' ? ' aktif' : ''}`}>
          <div className="pc">
            <div className="sec-head"><span className="sec-title">Semua Transaksi</span></div>

            {/* Search Bar Transaksi Admin */}
            <div className="search-box" style={{ marginBottom: 14 }}>
              <svg fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                className="search-input"
                placeholder="Cari transaksi (Kode TRX, kasir/user, total, metode)..."
                value={searchTrx}
                onChange={e => setSearchTrx(e.target.value)}
              />
            </div>

            <div className="tbl-wrap tt">
              <div className="tbl-h"><span>Kode</span><span>Kasir</span><span>Item</span><span>Total</span><span>Status</span></div>
              {filteredAdminTrx.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--S3)' }}>Tidak ada transaksi yang cocok</div>
              ) : (
                filteredAdminTrx.map(t => (
                  <div key={t.id} className="tbl-r" onClick={() => { setDetTrxId(t.id); nav('detail-trx') }}>
                    <span className="tc" style={{ fontWeight: 700 }}>{t.id}</span>
                    <span className="tc">{t.user}</span>
                    <span className="tc">{t.items.length} item</span>
                    <span className="tc" style={{ color: 'var(--G1)', fontWeight: 700 }}>{rp(t.total)}</span>
                    <span>
                      <span className="trx-status">Selesai</span>
                      <span style={{ marginLeft: 5, fontSize: 10, color: 'var(--S4)' }}>{t.metode === 'transfer' ? 'Transfer' : 'Cash'}</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── DETAIL TRX ADMIN ── */}
        <div className={`page${page === 'detail-trx' ? ' aktif' : ''}`}>
          <div className="pc">
            <button className="back-btn btn-lift" onClick={() => nav('transaksi')}>
              <svg fill="none" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>Kembali
            </button>
            {detTrx && (
              <>
                {showStruk === detTrx.id ? (
                  <Struk trx={detTrx} rp={rp} onSelesai={() => setShowStruk(null)} />
                ) : (
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
                      <div className="sum-row"><span>Kasir / User</span><span style={{ fontWeight: 600 }}>{detTrx.user}</span></div>
                      <div className="sum-row"><span>Tanggal &amp; Jam</span><span style={{ fontWeight: 600 }}>{detTrx.tgl}</span></div>
                      <div className="sum-row"><span>Metode Bayar</span><span style={{ fontWeight: 600 }}>{detTrx.metode === 'transfer' ? 'Transfer Bank' : 'Tunai (Cash)'}</span></div>
                      <div className="sum-total"><span>Total</span><span style={{ color: 'var(--G1)' }}>{rp(detTrx.total)}</span></div>
                    </div>
                    {detTrx.metode === 'transfer' && detTrx.bukti && (
                      <div style={{ marginTop: 12, background: 'var(--W)', borderRadius: 'var(--r)', padding: 14, border: '1px solid var(--S2)' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--T2)', marginBottom: 8 }}>Bukti Transfer</div>
                        <img src={detTrx.bukti} alt="Bukti" style={{ width: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 'var(--rs)' }} />
                      </div>
                    )}
                    <div className="struk-actions" style={{ marginTop: 14 }}>
                      <button className="btn-print btn-bounce" onClick={() => setShowStruk(detTrx.id)}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Lihat &amp; Cetak Struk
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── TENTANG ── */}
        <div className={`page${page === 'tentang' ? ' aktif' : ''}`}>
          <div className="about-page-wrap">
            <div className="about-content-box">
              <h2 className="about-main-title">Tentang Kami</h2>

              {/* Search Bar Tentang Admin */}
              <div className="search-box" style={{ marginBottom: 18 }}>
                <svg fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  className="search-input"
                  placeholder="Cari informasi toko, cabang, atau kontak..."
                  value={searchTentang}
                  onChange={e => setSearchTentang(e.target.value)}
                />
              </div>

              <div className="about-desc-block">
                <p>Toko Berkat Jaya adalah sebuah usaha retail yang secara khusus fokus pada penjualan sembako, singkatan dari sembilan bahan pokok, seperti beras, gula, minyak, tepung, dan produk pangan lainnya.</p>
                <p>Berkat Jaya telah menjadi pilihan utama bagi masyarakat yang mencari solusi praktis untuk memenuhi kebutuhan dapur mereka.</p>
              </div>

              <div className="about-info-cards">
                <div className="about-info-card" id="lokasi-toko">
                  <div className="aic-ico"><svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                  <div>
                    <div className="aic-title">Alamat &amp; Lokasi</div>
                    <div className="aic-sub">Jl. Tambak Rejo 59, Surabaya</div>
                    <div className="aic-tag">SURABAYA</div>
                  </div>
                </div>
                <div className="about-info-card">
                  <div className="aic-ico"><svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.42 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.85a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16l.19.92z"/></svg></div>
                  <div>
                    <div className="aic-title">Kontak Resmi</div>
                    <div className="aic-sub" style={{ fontWeight: 600, color: 'var(--G1)' }}>0813-3119-2564</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Admin */}
      <Footer onNav={nav} isAdmin={true} />

      <nav className="bottom-nav">
        {[
          { key: 'dashboard', label: 'Dashboard', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></> },
          { key: 'produk', label: 'Produk', icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></> },
          { key: 'transaksi', label: 'Transaksi', icon: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></> },
          { key: 'tentang', label: 'Tentang', icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></> },
        ].map(item => (
          <button key={item.key} className={`bnav-item${page === item.key ? ' aktif' : ''}`} onClick={() => nav(item.key)}>
            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{item.icon}</svg>
            {item.label}
          </button>
        ))}
      </nav>

      <div id="print-area" style={{ display: 'none' }} />
    </div>
  )
}
