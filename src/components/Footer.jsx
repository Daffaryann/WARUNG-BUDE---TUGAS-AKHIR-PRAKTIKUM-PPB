export function Footer({ onNav, isAdmin }) {
  const handleLocation = () => {
    onNav('tentang')
    setTimeout(() => {
      const el = document.getElementById('lokasi-toko')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="fb-logo">
            <div className="fb-logomark-round">
              <span className="fb-bj">BJ</span>
            </div>
          </div>
          <div className="fb-tagline">Sembako, Groceries, Online.</div>
        </div>

        <div className="footer-col">
          <h4>TAUTAN</h4>
          <ul>
            <li onClick={() => onNav(isAdmin ? 'dashboard' : 'beranda')}>Beranda</li>
            <li onClick={() => onNav('produk')}>Produk</li>
            <li onClick={() => onNav('tentang')}>Tentang Kami</li>
            <li onClick={handleLocation}>Lokasi Kami</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>ALAMAT KANTOR</h4>
          <address>
            Jl Tambak Rejo 59<br />
            Surabaya<br />
            <br />
            <span className="footer-tag">Tersedia di: SURABAYA</span>
          </address>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; 2026 Berkat Jaya
      </div>
    </footer>
  )
}
