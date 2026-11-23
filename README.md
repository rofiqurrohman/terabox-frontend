# TeraBox Downloader — Frontend

Vue 3 + TypeScript + Vite, UI dengan [shadcn-vue](https://www.shadcn-vue.com) (reka-ui + Tailwind CSS 4),
state dengan Pinia, HTTP dengan axios, dan pemutar video HLS dengan hls.js.

## Fitur

- Tempel link TeraBox (atau tombol **Tempel** dari clipboard)
- **Navigasi per folder** dengan breadcrumb: hanya isi folder yang dibuka yang
  diambil (ringan untuk share besar). Root yang berisi 1 folder langsung dibuka.
- **ZIP per folder**: tombol ZIP di setiap folder + "Download folder ini (.zip)";
  dialog menampilkan jumlah file & total ukuran sebelum download dimulai
- Download file lewat proxy backend (resume didukung), salin link download
- Putar video langsung (HLS) di dialog
- Cari file kalau isinya banyak (> 5 file)
- Riwayat 8 link terakhir (disimpan di localStorage)
- Dark mode, pesan error ramah dalam Bahasa Indonesia, tampilan mobile-friendly

## Menjalankan

Pastikan backend jalan di `http://localhost:8080` (lihat `../backend/README.md`).

```bash
npm install
npm run dev        # http://localhost:5173
```

Saat development, request `/api/*` diteruskan ke backend oleh proxy Vite
(`vite.config.ts`), jadi tidak perlu mengatur CORS.

Build production:

```bash
cp .env.example .env.production   # isi VITE_API_BASE_URL
npm run build                      # hasil di dist/
```

## Environment

| Variable | Kapan | Contoh |
|---|---|---|
| `VITE_API_BASE_URL` | build production | `https://api.domainmu.com` (kosong = origin yang sama) |
| `DEV_API_PROXY_TARGET` | `npm run dev` | `http://localhost:8080` (default) |

Kalau frontend dan backend beda domain, tambahkan domain frontend ke
`CORS_ALLOWED_ORIGINS` di backend.

## Struktur

```
src/
├── main.ts                    # pasang Pinia, CSS, mount App
├── App.vue                    # layout halaman
├── env.d.ts                   # tipe env Vite + shim hls.js/light
├── types/api.ts               # tipe respons backend
├── lib/
│   ├── api.ts                 # instance axios + ApiError + teraboxApi
│   ├── errors.ts              # kode error → pesan untuk user
│   ├── file-category.ts       # kategori TeraBox → label & ikon
│   └── utils.ts               # cn, formatBytes, formatDate, looksLikeUrl
├── stores/extract.ts          # Pinia: buka share, navigasi folder, riwayat
└── components/
    ├── AppHeader.vue          # logo + toggle dark mode
    ├── ExtractForm.vue        # input link + tombol Tempel/Proses
    ├── ResultSkeleton.vue     # loading state
    ├── ErrorState.vue         # alert error + Coba lagi
    ├── ShareResult.vue        # header folder + pencarian + daftar folder & file
    ├── FolderBreadcrumb.vue   # Semua file / Koleksi / Film
    ├── FolderRow.vue          # satu folder: buka / ZIP
    ├── ZipDialog.vue          # konfirmasi ZIP (jumlah file & ukuran) → download
    ├── FileRow.vue            # satu file: Putar / Download / Salin
    ├── VideoPlayerDialog.vue  # dialog pemutar video
    ├── HlsPlayer.vue          # <video> + hls.js (lazy load)
    ├── RecentHistory.vue      # riwayat link
    └── ui/                    # komponen shadcn-vue (hasil CLI, jangan diedit manual)
```

Tambah komponen shadcn-vue:

```bash
npx shadcn-vue@latest add <nama-komponen>
```

## Catatan

- `placeholder` / atribut statis berisi `https://` pada **komponen** Vue memicu
  error palsu di `vue-tsc` (versi saat ini). Karena itu contoh link di placeholder
  ditulis tanpa `https://`.
- hls.js dimuat hanya saat video diputar (build `light`, ±115 KB gzip), jadi
  halaman awal tetap ringan.
