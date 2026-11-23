import axios, { AxiosError } from 'axios'
import type { ApiErrorBody, ErrorCode, ExtractResponse, HealthResponse, ZipInfo } from '@/types/api'

/**
 * Error tunggal untuk semua kegagalan request, supaya komponen cukup
 * mengecek `error.code` tanpa peduli detail axios.
 */
export class ApiError extends Error {
  readonly code: ErrorCode
  readonly status?: number
  /** Detik yang harus ditunggu (dari header Retry-After saat 429). */
  readonly retryAfter?: number

  constructor(code: ErrorCode, message: string, status?: number, retryAfter?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.retryAfter = retryAfter
  }
}

const http = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, ''),
  // Extract folder besar bisa lama; backend sendiri membatasi 60 detik.
  timeout: 90_000,
  headers: { 'Content-Type': 'application/json' },
})

// Semua error axios diubah jadi ApiError di satu tempat (interceptor).
http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)

function toApiError(error: unknown): ApiError {
  if (axios.isCancel(error)) {
    return new ApiError('CANCELED', 'Request dibatalkan')
  }
  if (!(error instanceof AxiosError)) {
    return new ApiError('UNKNOWN', error instanceof Error ? error.message : String(error))
  }
  if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
    return new ApiError('TIMEOUT', 'Request timeout')
  }

  const response = error.response
  if (!response) {
    return new ApiError('NETWORK_ERROR', 'Tidak bisa terhubung ke server')
  }

  const body = response.data as Partial<ApiErrorBody> | undefined
  const retryAfter = Number(response.headers['retry-after']) || undefined
  return new ApiError(
    body?.error?.code ?? 'UNKNOWN',
    body?.error?.message ?? `HTTP ${response.status}`,
    response.status,
    retryAfter,
  )
}

export const teraboxApi = {
  /** Ambil isi satu folder share. dir kosong = root. */
  async extract(url: string, dir?: string, signal?: AbortSignal): Promise<ExtractResponse> {
    const { data } = await http.post<ExtractResponse>('/api/v1/extract', { url, dir }, { signal })
    return data
  },

  /** Jumlah file & total ukuran ZIP sebuah folder. infoUrl dari zip_info_url (URL lengkap). */
  async zipInfo(infoUrl: string, signal?: AbortSignal): Promise<ZipInfo> {
    const { data } = await http.get<ZipInfo>(infoUrl, { signal })
    return data
  },

  async health(): Promise<HealthResponse> {
    const { data } = await http.get<HealthResponse>('/api/v1/health')
    return data
  },
}
