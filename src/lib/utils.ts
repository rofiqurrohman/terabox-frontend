export { cn } from 'cn'

/** 1536 → "1.5 KB" */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

/** Unix timestamp (detik) → "23 Nov 2026" */
export function formatDate(unixSeconds: number): string {
  if (!unixSeconds) return '-'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(unixSeconds * 1000)
}

/** Cek ringan sebelum kirim ke server. Validasi domain lengkap dilakukan backend. */
export function looksLikeUrl(value: string): boolean {
  const text = value.trim()
  if (!text) return false
  try {
    const url = new URL(text.includes('://') ? text : `https://${text}`)
    return url.hostname.includes('.')
  } catch {
    return false
  }
}
