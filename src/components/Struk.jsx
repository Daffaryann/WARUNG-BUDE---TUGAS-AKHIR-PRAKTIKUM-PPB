export function Struk({ trx, rp, onSelesai }) {
  const { id, tgl, nama, total, metode, items } = trx

  const metodeLbl = metode === 'transfer' ? 'Transfer Bank' : 'Tunai (Cash)'

  const itemsHtml = items.map(i =>
    `<div class="struk-item">
      <div><div class="si-nama">${i.nama}</div><div class="si-qty">${i.qty} ${i.sat} × ${rpStr(i.h)}</div></div>
      <div class="si-harga">${rpStr(i.qty * i.h)}</div>
    </div>`
  ).join('')

  function rpStr(n) { return 'Rp ' + Number(n).toLocaleString('id-ID') }

  function handleCetak() {
    const pa = document.getElementById('print-area')
    pa.innerHTML = buildStrukHtml()
    pa.style.display = 'block'
    window.print()
    setTimeout(() => { pa.style.display = 'none' }, 1000)
  }

  function handleDownload() {
    const html = `<!DOCTYPE html><html lang="id"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Struk ${id}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#f5f5f0;display:flex;justify-content:center;padding:24px;color:#0F1F18}
.struk-wrap{background:#fff;border-radius:12px;padding:28px 24px;width:100%;max-width:360px;box-shadow:0 4px 24px rgba(0,0,0,.12)}
.struk-header{text-align:center;padding-bottom:14px;border-bottom:2px dashed #E8EEEB;margin-bottom:14px}
.sh-logo{font-size:20px;font-weight:800;color:#1A7A3C;letter-spacing:-.5px;margin-bottom:4px}
.sh-sub{font-size:11px;color:#9EB5A8;margin-top:2px;line-height:1.6}
.sh-no{font-size:12px;font-weight:700;color:#0F1F18;margin-top:10px;background:#E8F5EE;border-radius:6px;padding:5px 12px;display:inline-block}
.struk-meta{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px dashed #E8EEEB}
.struk-meta-row{display:flex;justify-content:space-between;font-size:11.5px}
.struk-meta-row .sk{color:#9EB5A8}.struk-meta-row .sv{font-weight:600;color:#0F1F18;text-align:right}
.struk-items{margin-bottom:14px}
.struk-item{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F0F5F2;font-size:12px}
.struk-item:last-child{border-bottom:none}
.si-nama{color:#2D4438;flex:1}.si-qty{color:#9EB5A8;font-size:11px;margin:2px 0}
.si-harga{font-weight:700;color:#0F1F18;white-space:nowrap;margin-left:8px}
.struk-total-block{border-top:2px dashed #E8EEEB;padding-top:12px;margin-top:6px}
.struk-total-row{display:flex;justify-content:space-between;font-size:12px;padding:4px 0}
.struk-total-row.grand{font-size:15px;font-weight:800;color:#1A7A3C;border-top:1px solid #E8EEEB;margin-top:8px;padding-top:10px}
.struk-pay-method{display:flex;align-items:center;justify-content:space-between;padding:6px 0;margin:6px 0;font-size:12px;border-bottom:1px solid #E8EEEB}
.spm-label{color:#9EB5A8}.spm-val{font-weight:600;color:#0F1F18}
.struk-footer{text-align:center;padding-top:14px;border-top:2px dashed #E8EEEB;margin-top:14px}
.sf-thanks{font-size:14px;font-weight:800;color:#0F1F18;margin-bottom:6px}
.struk-footer p{font-size:11px;color:#9EB5A8;line-height:1.65}
</style></head><body>
<div class="struk-wrap">${buildStrukHtml()}</div>
</body></html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `Struk-${id}.html`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function buildStrukHtml() {
    return `
      <div class="struk-header">
        <div class="sh-logo">WaroengBude</div>
        <div class="sh-sub">Toko Berkat Jaya<br>Jl. Tambak Rejo 59, Surabaya<br>Telp: 0813-3119-2564</div>
        <div class="sh-no">${id}</div>
      </div>
      <div class="struk-meta">
        <div class="struk-meta-row"><span class="sk">Tanggal</span><span class="sv">${tgl}</span></div>
        <div class="struk-meta-row"><span class="sk">Kasir</span><span class="sv">${nama}</span></div>
        <div class="struk-meta-row"><span class="sk">Lokasi</span><span class="sv">Jl. Tambak Rejo 59</span></div>
      </div>
      <div class="struk-items">${itemsHtml}</div>
      <div class="struk-total-block">
        <div class="struk-total-row"><span>Subtotal</span><span>${rpStr(total)}</span></div>
        <div class="struk-total-row"><span>Biaya Layanan</span><span>Rp 0</span></div>
        <div class="struk-total-row grand"><span>TOTAL</span><span>${rpStr(total)}</span></div>
      </div>
      <div class="struk-pay-method">
        <span class="spm-label">Metode Bayar</span>
        <span class="spm-val">${metodeLbl}</span>
      </div>
      <div class="struk-footer">
        <div class="sf-thanks">Terima Kasih</div>
        <p>Barang yang sudah dibeli tidak dapat<br>dikembalikan. Simpan struk ini sebagai<br>bukti transaksi Anda.</p>
      </div>
    `
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <svg width="48" height="48" fill="none" stroke="var(--G1)" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--T)', marginTop: 6 }}>Pembayaran Berhasil!</div>
        <div style={{ fontSize: 12, color: 'var(--S3)', marginTop: 3 }}>{id} telah dicatat</div>
      </div>

      <div className="struk-wrap">
        <div className="struk-header">
          <div className="sh-logo">WaroengBude</div>
          <div className="sh-sub">Toko Berkat Jaya<br />Jl. Tambak Rejo 59, Surabaya<br />Telp: 0813-3119-2564</div>
          <div className="sh-no">{id}</div>
        </div>

        <div className="struk-meta">
          <div className="struk-meta-row"><span className="sk">Tanggal</span><span className="sv">{tgl}</span></div>
          <div className="struk-meta-row"><span className="sk">Kasir</span><span className="sv">{nama}</span></div>
          <div className="struk-meta-row"><span className="sk">Lokasi</span><span className="sv">Jl. Tambak Rejo 59</span></div>
        </div>

        <div className="struk-items">
          {items.map((i, idx) => (
            <div className="struk-item" key={idx}>
              <div>
                <div className="si-nama">{i.nama}</div>
                <div className="si-qty">{i.qty} {i.sat} × {rp(i.h)}</div>
              </div>
              <div className="si-harga">{rp(i.qty * i.h)}</div>
            </div>
          ))}
        </div>

        <div className="struk-total-block">
          <div className="struk-total-row"><span>Subtotal</span><span>{rp(total)}</span></div>
          <div className="struk-total-row"><span>Biaya Layanan</span><span>Rp 0</span></div>
          <div className="struk-total-row grand"><span>TOTAL</span><span>{rp(total)}</span></div>
        </div>

        <div className="struk-pay-method">
          <span className="spm-label">Metode Bayar</span>
          <span className="spm-val pay-label-badge">{metodeLbl}</span>
        </div>

        <div className="struk-footer">
          <div className="sf-thanks">Terima Kasih</div>
          <p>Barang yang sudah dibeli tidak dapat<br />dikembalikan. Simpan struk ini sebagai<br />bukti transaksi Anda.</p>
        </div>
      </div>

      <div className="struk-actions">
        <button className="btn-print btn-bounce" onClick={handleCetak}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Cetak Struk
        </button>
        <button className="btn-download btn-bounce" onClick={handleDownload}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Download
        </button>
      </div>

      <button className="btn btn-r btn-bounce" onClick={onSelesai} style={{ width: '100%', padding: 11, marginTop: 8 }}>
        Selesai
      </button>
    </div>
  )
}
