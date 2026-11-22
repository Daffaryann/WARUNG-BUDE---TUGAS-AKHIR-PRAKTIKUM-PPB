import { supabase } from '../lib/supabase'

// Helper untuk mengecek format UUID valid dari Supabase Auth
const isValidUUID = (str) =>
    typeof str === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

// Helper konversi base64 ke Blob jika form memakai FileReader
const base64ToBlob = (base64Data) => {
    const [header, data] = base64Data.split(',')
    const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
    const byteString = atob(data)
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ab], { type: mime })
}

// Upload foto (mendukung File objek maupun string base64) ke Supabase Storage
export async function uploadGambar(bucket, fileInput) {
    if (!fileInput) return ''
    // Jika sudah berupa URL publik dari Supabase, kembalikan langsung
    if (typeof fileInput === 'string' && fileInput.startsWith('http')) {
        return fileInput
    }

    let fileToUpload = fileInput
    let ext = 'jpg'

    if (typeof fileInput === 'string' && fileInput.startsWith('data:image')) {
        fileToUpload = base64ToBlob(fileInput)
        ext = fileToUpload.type.split('/')[1] || 'jpg'
    } else if (fileInput instanceof File) {
        ext = fileInput.name.split('.').pop() || 'jpg'
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileToUpload, { upsert: true })

    if (uploadError) {
        console.error(`Gagal upload ke ${bucket}:`, uploadError.message)
        throw uploadError
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
    return data.publicUrl
}

// ── OPERASI TABEL PRODUK ──
export const produkAPI = {
    async getAll() {
        const { data, error } = await supabase
            .from('produk')
            .select('*')
            .order('id', { ascending: true })
        if (error) throw error
        return data || []
    },

    async create(produkBaru) {
        const imgUrl = await uploadGambar('produk-images', produkBaru.img)
        const payload = {
            nama: produkBaru.nama,
            kat: produkBaru.kat,
            hB: Number(produkBaru.hB) || 0,
            hJ: Number(produkBaru.hJ) || 0,
            stok: Number(produkBaru.stok) || 0,
            sat: produkBaru.sat || 'pcs',
            img: imgUrl,
        }

        const { data, error } = await supabase
            .from('produk')
            .insert([payload])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async update(id, perubahan) {
        const payload = { ...perubahan }
        if (perubahan.img) {
            payload.img = await uploadGambar('produk-images', perubahan.img)
        }
        if (perubahan.hB !== undefined) payload.hB = Number(perubahan.hB)
        if (perubahan.hJ !== undefined) payload.hJ = Number(perubahan.hJ)
        if (perubahan.stok !== undefined) payload.stok = Number(perubahan.stok)

        const { data, error } = await supabase
            .from('produk')
            .update(payload)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async remove(id) {
        const { error } = await supabase.from('produk').delete().eq('id', id)
        if (error) throw error
    },
}

// ── OPERASI TABEL TRANSAKSI ──
export const transaksiAPI = {
    async getAll() {
        const { data, error } = await supabase
            .from('transaksi')
            .select('*')
            .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
    },

    async create(trxBaru) {
        const buktiUrl = trxBaru.bukti
            ? await uploadGambar('bukti-transfer', trxBaru.bukti)
            : ''

        const payload = {
            id: trxBaru.id || `TRX-${Date.now().toString().slice(-6)}`,
            user_id: isValidUUID(trxBaru.user_id) ? trxBaru.user_id : null,
            nama: trxBaru.nama || 'Pelanggan',
            tgl: trxBaru.tgl || new Date().toLocaleDateString('id-ID'),
            total: Number(trxBaru.total) || 0,
            metode: trxBaru.metode || 'cash',
            bukti: buktiUrl,
            items: trxBaru.items || [],
        }

        const { data, error } = await supabase
            .from('transaksi')
            .insert([payload])
            .select()
            .single()

        if (error) throw error
        return data
    },
}