// Tipe data mengikuti respons backend (lihat backend/internal/httpapi/openapi.yaml).

export interface Thumbs {
  url1: string
  url2: string
  url3: string
  icon: string
}

export interface ShareFile {
  fs_id: string
  name: string
  path: string
  size: number
  /** 1 video, 2 audio, 3 gambar, 4 dokumen, 5 aplikasi, 6 lainnya, 7 torrent */
  category: number
  md5?: string
  server_ctime: number
  server_mtime: number
  thumbs: Thumbs
  dlink: string
  /** Hanya ada untuk video. */
  direct_link?: string
  stream_url?: string
  download_proxy_url: string
  /** Hanya ada untuk video. */
  stream_proxy_url?: string
}

/** Link ZIP sebuah folder: info dulu (jumlah & ukuran), lalu download. */
export interface ZipLinks {
  zip_download_url: string
  zip_info_url: string
}

export interface ShareFolder extends ZipLinks {
  name: string
  path: string
  server_mtime: number
}

/** Isi SATU folder share (tidak rekursif). */
export interface ExtractResponse extends Partial<ZipLinks> {
  surl: string
  title: string
  share_id: number
  uk: number
  cached: boolean
  /** Folder yang sedang dibuka, "/" = root. */
  dir: string
  folder_count: number
  file_count: number
  /** Ukuran file langsung di folder ini (subfolder tidak dihitung). */
  total_size: number
  folders: ShareFolder[]
  files: ShareFile[]
}

export interface ZipInfo {
  name: string
  dir: string
  file_count: number
  total_size: number
  /** 0 = tanpa batas */
  max_size: number
  allowed: boolean
}

export interface HealthResponse {
  status: 'ok' | 'degraded'
  cookies_total: number
  cookies_available: number
}

/** Kode error dari backend + kode tambahan dari sisi frontend. */
export type ErrorCode =
  | 'INVALID_REQUEST'
  | 'INVALID_URL'
  | 'SHARE_NOT_FOUND'
  | 'SHARE_TOO_LARGE'
  | 'ZIP_TOO_LARGE'
  | 'ZIP_BUSY'
  | 'INVALID_TOKEN'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'UPSTREAM_ERROR'
  | 'NO_COOKIES'
  | 'UPSTREAM_TIMEOUT'
  | 'REQUEST_CANCELED'
  | 'INTERNAL_ERROR'
  // frontend
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'CANCELED'
  | 'UNKNOWN'

export interface ApiErrorBody {
  error: {
    code: ErrorCode
    message: string
  }
}
