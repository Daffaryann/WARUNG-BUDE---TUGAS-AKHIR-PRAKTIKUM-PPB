import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/Toast'

// ══ TOGGLE PASSWORD ══
function TogglePw({ inputId }) {
  const [show, setShow] = useState(false)
  const toggle = () => {
    const el = document.getElementById(inputId)
    if (el) { el.type = show ? 'password' : 'text' }
    setShow(!show)
  }
  return (
    <button type="button" className="toggle-pw" onClick={toggle}>
      {show
        ? <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  )
}

// ══ AUTH LEFT PANEL ══
function AuthLeft({ title, desc, feats }) {
  return (
    <div className="auth-left">
      <div className="auth-logo-wrap">
        <div className="auth-logo-img"><div className="logo-ph">W</div></div>
        <div className="auth-logo-name">WaroengBude<small>Sembako &amp; Groceries Online</small></div>
      </div>
      <h2>{title}</h2>
      <p>{desc}</p>
      {feats && (
        <div className="auth-left-feat">
          {feats.map((f, i) => (
            <div className="feat-item" key={i}><div className="feat-dot" />{f}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ══ LOGIN USER ══
export function LoginPage({ onShowReg, onShowAdmin, onLoggedIn }) {
  const { login, loginGuest } = useApp()
  const toast = useToast()
  const [err, setErr] = useState('')
  const [u, setU] = useState('')
  const [p, setP] = useState('')

  const submit = async () => {
    if (!u || !p) { setErr('Email dan password wajib diisi.'); return }

    // 1. Coba login via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: u,
      password: p,
    })

    if (!error && data?.session) {
      setErr('')
      onLoggedIn('user')
      return
    }

    // 2. Jika Supabase error (misal "Email not confirmed" / "rate limit"), periksa akun lokal/demo
    if (login(u, p)) {
      setErr('')
      onLoggedIn('user')
      return
    }

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setErr('Email belum dikonfirmasi di Supabase! Harap cek email Anda, atau matikan opsi "Confirm email" di Dashboard Supabase (Authentication -> Providers -> Email).')
      } else {
        setErr(error.message)
      }
      return
    }

    setErr('Email atau password salah.')
  }

  const guest = () => { loginGuest(); toast('Masuk sebagai Tamu — transaksi tidak tersimpan'); onLoggedIn('user') }

  return (
    <div className="auth-screen aktif">
      <AuthLeft
        title="Belanja Sembako Jadi Lebih Mudah"
        desc="Pesan kebutuhan sehari-hari Anda kapan saja — kami siapkan produk terbaik dengan harga bersahabat."
        feats={['Produk sembako lengkap & berkualitas', 'Harga terjangkau, stok selalu tersedia', 'Transaksi mudah & tercatat rapi']}
      />
      <div className="auth-right">
        <div className="auth-card">
          <h3>Masuk</h3>
          <p className="sub">Masuk ke akun pelanggan Anda</p>
          <div className="auth-info"><b>Demo:</b> Username <b>user</b> / Password <b>user123</b></div>
          {err && <div className="auth-err show">{err}</div>}
          <div className="form-group">
            <label className="form-label">Email / Username</label>
            <input className="form-input" value={u} onChange={e => setU(e.target.value)} placeholder="nama@email.com atau user" />
          </div>
          <div className="form-group">
            <div className="form-row-label">
              <label className="form-label">Password</label>
              <span className="lupa-pw">Lupa password?</span>
            </div>
            <div className="konfirmasi-pass-wrap">
              <input id="loginPass" className="form-input" type="password" value={p} onChange={e => setP(e.target.value)} placeholder="Masukkan password" style={{ paddingRight: 40 }} onKeyDown={e => e.key === 'Enter' && submit()} />
              <TogglePw inputId="loginPass" />
            </div>
          </div>
          <button className="btn-submit btn-bounce" onClick={submit}>Masuk</button>
          <div className="auth-or">atau</div>
          <button className="btn-guest btn-lift" onClick={guest}>
            <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Lanjut sebagai Tamu
          </button>
          <p className="auth-daftar">Belum punya akun? <b onClick={onShowReg}>Daftar sekarang</b></p>
          <p className="auth-daftar" style={{ marginTop: 6 }}>Admin? <b onClick={onShowAdmin}>Login Admin</b></p>
        </div>
      </div>
    </div>
  )
}

// ══ REGISTER ══
export function RegisterPage({ onShowLogin, onLoggedIn }) {
  const { login, saveRegisteredUser } = useApp()
  const toast = useToast()
  const [err, setErr] = useState('')
  const [nama, setNama] = useState('')
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [pk, setPk] = useState('')

  const submit = async () => {
    if (!nama || !u || !p) { setErr('Semua field wajib diisi.'); return }
    if (p.length < 6) { setErr('Password minimal 6 karakter.'); return }
    if (p !== pk) { setErr('Password dan konfirmasi tidak cocok.'); return }

    // Simpan ke daftar user terdaftar lokal agar langsung bisa dipakai login
    if (saveRegisteredUser) {
      saveRegisteredUser({ u, p, nama, role: 'user' })
    }

    const { data, error } = await supabase.auth.signUp({
      email: u,
      password: p,
      options: { data: { nama } }   // simpan nama di metadata
    })

    if (error) {
      if (error.message.includes('rate limit')) {
        setErr('Supabase email rate limit tercapai. Akun Anda tetap tersimpan! Matikan opsi "Confirm email" di Dashboard Supabase agar langsung aktif.')
        onShowLogin()
        return
      }
      setErr(error.message)
      return
    }

    setErr('')
    if (data?.session) {
      toast('Akun berhasil dibuat! Anda langsung masuk.')
      onLoggedIn('user')
    } else {
      toast('Akun berhasil dibuat! Silakan masuk.')
      onShowLogin()
    }
  }

  return (
    <div className="auth-screen aktif">
      <AuthLeft
        title="Bergabung Bersama Kami"
        desc="Daftar sekarang dan nikmati kemudahan belanja sembako online dengan harga terbaik."
        feats={['Gratis daftar, langsung bisa belanja', 'Riwayat transaksi tersimpan otomatis', 'Produk lengkap dengan harga terbaik']}
      />
      <div className="auth-right">
        <div className="auth-card">
          <h3>Daftar Akun</h3>
          <p className="sub">Buat akun pelanggan baru — gratis</p>
          {err && <div className="auth-err show">{err}</div>}
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input className="form-input" value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama lengkap Anda" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={u} onChange={e => setU(e.target.value)} placeholder="nama@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="konfirmasi-pass-wrap">
              <input id="regPass" className="form-input" type="password" value={p} onChange={e => setP(e.target.value)} placeholder="Minimal 6 karakter" style={{ paddingRight: 40 }} />
              <TogglePw inputId="regPass" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Konfirmasi Password</label>
            <div className="konfirmasi-pass-wrap">
              <input id="regPassK" className="form-input" type="password" value={pk} onChange={e => setPk(e.target.value)} placeholder="Ulangi password" style={{ paddingRight: 40 }} onKeyDown={e => e.key === 'Enter' && submit()} />
              <TogglePw inputId="regPassK" />
            </div>
          </div>
          <button className="btn-submit btn-bounce" onClick={submit}>Daftar Sekarang</button>
          <p className="auth-daftar" style={{ marginTop: 14 }}>Sudah punya akun? <b onClick={onShowLogin}>Masuk di sini</b></p>
        </div>
      </div>
    </div>
  )
}

// ══ ADMIN LOGIN ══
export function AdminLoginPage({ onShowLogin, onLoggedIn }) {
  const { loginAdmin } = useApp()
  const [err, setErr] = useState('')
  const [u, setU] = useState('')
  const [p, setP] = useState('')

  const submit = () => {
    if (!u || !p) { setErr('Isi username dan password.'); return }
    if (!loginAdmin(u, p)) { setErr('Kredensial admin tidak valid.'); return }
    setErr(''); onLoggedIn('admin')
  }

  return (
    <div className="auth-screen aktif">
      <div className="admin-auth-wrap">
        <div className="admin-login-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--G1)', color: '#fff', fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>W</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--T)' }}>WaroengBude</div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div className="admin-badge">
              <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Panel Administrator
            </div>
          </div>
          <div className="auth-info"><b>Demo:</b> Username <b>admin</b> / Password <b>admin123</b></div>
          {err && <div className="auth-err show">{err}</div>}
          <div className="form-group">
            <label className="form-label">Username Admin</label>
            <input className="form-input" value={u} onChange={e => setU(e.target.value)} placeholder="Username admin" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="konfirmasi-pass-wrap">
              <input id="adminPass" className="form-input" type="password" value={p} onChange={e => setP(e.target.value)} placeholder="Password admin" style={{ paddingRight: 40 }} onKeyDown={e => e.key === 'Enter' && submit()} />
              <TogglePw inputId="adminPass" />
            </div>
          </div>
          <button className="btn-submit btn-bounce" onClick={submit} style={{ background: 'var(--G3)' }}>Masuk sebagai Admin</button>
          <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--S3)' }}>
            Bukan admin? <b style={{ color: 'var(--G1)', cursor: 'pointer' }} onClick={onShowLogin}>Kembali ke login</b>
          </p>
        </div>
      </div>
    </div>
  )
}
