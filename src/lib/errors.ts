import { ApiError } from '@/lib/api'
import type { ErrorCode } from '@/types/api'

export interface ErrorMessage {
  title: string
  description: string
}

const messages: Partial<Record<ErrorCode, ErrorMessage>> = {
  INVALID_REQUEST: {
    title: 'Link kosong',
    description: 'Tempel link share TeraBox terlebih dahulu.',
  },
  INVALID_URL: {
    title: 'Link tidak valid',
    description: 'Pastikan link berasal dari TeraBox, contoh: https://terabox.com/s/1xxxxx',
  },
  SHARE_NOT_FOUND: {
    title: 'File tidak ditemukan',
    description: 'Link mungkin sudah dihapus, kedaluwarsa, atau diketik salah.',
  },
  SHARE_TOO_LARGE: {
    title: 'Folder terlalu besar untuk ZIP',
    description: 'Jumlah file atau kedalaman folder melebihi batas server. Buka folder ini lalu ZIP subfolder yang lebih kecil.',
  },
  ZIP_TOO_LARGE: {
    title: 'Folder terlalu besar untuk ZIP',
    description: 'Total ukuran melebihi batas server. ZIP subfolder yang lebih kecil, atau download file satu per satu.',
  },
  ZIP_BUSY: {
    title: 'Server sedang membuat ZIP lain',
    description: 'Coba lagi dalam beberapa saat.',
  },
  INVALID_TOKEN: {
    title: 'Link download kedaluwarsa',
    description: 'Proses ulang link untuk mendapatkan link download baru.',
  },
  NO_COOKIES: {
    title: 'Server sedang sibuk',
    description: 'Semua akun server sedang tidak tersedia. Coba lagi beberapa menit lagi.',
  },
  UPSTREAM_ERROR: {
    title: 'Gagal mengambil data dari TeraBox',
    description: 'TeraBox sedang bermasalah atau menolak permintaan. Coba lagi nanti.',
  },
  UPSTREAM_TIMEOUT: {
    title: 'TeraBox terlalu lama merespons',
    description: 'Coba lagi sebentar lagi.',
  },
  TIMEOUT: {
    title: 'Waktu habis',
    description: 'Server terlalu lama merespons. Coba lagi.',
  },
  NETWORK_ERROR: {
    title: 'Tidak bisa terhubung',
    description: 'Periksa koneksi internet kamu, atau server sedang tidak aktif.',
  },
}

/** Ubah error apa pun jadi judul + deskripsi yang ramah untuk user. */
export function describeError(error: unknown): ErrorMessage {
  if (error instanceof ApiError) {
    if (error.code === 'RATE_LIMITED') {
      const wait = error.retryAfter ? ` dalam ${error.retryAfter} detik` : ' sebentar lagi'
      return {
        title: 'Terlalu banyak permintaan',
        description: `Tunggu dulu, lalu coba lagi${wait}.`,
      }
    }
    const known = messages[error.code]
    if (known) return known
  }
  return {
    title: 'Terjadi kesalahan',
    description: 'Ada yang tidak beres. Coba lagi beberapa saat lagi.',
  }
}
