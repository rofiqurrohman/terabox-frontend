/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL backend, contoh https://api.domainmu.com. Kosong = origin yang sama (pakai proxy Vite saat dev). */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// hls.js tidak menyediakan tipe untuk build "light", padahal API-nya sama.
declare module 'hls.js/light' {
  export * from 'hls.js'
  export { default } from 'hls.js'
}
