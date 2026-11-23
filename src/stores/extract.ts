import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { ApiError, teraboxApi } from '@/lib/api'
import { looksLikeUrl } from '@/lib/utils'
import type { ExtractResponse } from '@/types/api'

export type ExtractStatus = 'idle' | 'loading' | 'success' | 'error'

export interface HistoryItem {
  url: string
  title: string
  savedAt: number
}

const HISTORY_LIMIT = 8

/**
 * Store untuk membuka share + navigasi folder + riwayat.
 * Ditulis dengan gaya "setup store" (mirip <script setup>):
 * ref = state, computed = getter, function = action.
 *
 * Alur:
 *   extract(link)     → buka root share (skeleton loading)
 *   openFolder(path)  → buka subfolder (listing lama tetap tampil, ada indikator loading)
 */
export const useExtractStore = defineStore('extract', () => {
  // ---------- state ----------
  const url = ref('') // isi input
  const shareUrl = ref('') // link share yang sedang dibuka
  const status = ref<ExtractStatus>('idle')
  const listing = shallowRef<ExtractResponse | null>(null)
  const error = shallowRef<unknown>(null)
  const navigating = ref(false)

  // Riwayat disimpan di localStorage browser (otomatis sinkron).
  const history = useLocalStorage<HistoryItem[]>('terabox:history', [])

  let controller: AbortController | null = null

  // ---------- getters ----------
  const isLoading = computed(() => status.value === 'loading')

  // ---------- actions ----------

  /** Mulai request baru dan batalkan request sebelumnya (kalau masih jalan). */
  function startRequest(): AbortSignal {
    controller?.abort()
    controller = new AbortController()
    return controller.signal
  }

  async function extract(input = url.value) {
    const link = input.trim()
    url.value = link

    if (!looksLikeUrl(link)) {
      status.value = 'error'
      error.value = new ApiError(link ? 'INVALID_URL' : 'INVALID_REQUEST', 'Link tidak valid')
      return
    }

    const signal = startRequest()
    status.value = 'loading'
    navigating.value = false
    error.value = null
    listing.value = null

    try {
      let data = await teraboxApi.extract(link, undefined, signal)

      // Kebanyakan share berisi 1 folder di root → langsung buka folder itu.
      const onlyFolder = data.files.length === 0 && data.folders.length === 1 ? data.folders[0] : undefined
      if (onlyFolder) {
        data = await teraboxApi.extract(link, onlyFolder.path, signal)
      }

      shareUrl.value = link
      listing.value = data
      status.value = 'success'
      saveHistory(link, data)
    } catch (err) {
      // Request lama yang dibatalkan tidak boleh menimpa state request baru.
      if (err instanceof ApiError && err.code === 'CANCELED') return
      error.value = err
      status.value = 'error'
    }
  }

  /**
   * Buka folder lain dari share yang sama. Listing lama tetap tampil selama
   * loading. Error dilempar (throw) supaya komponen bisa menampilkan toast.
   */
  async function openFolder(dir: string) {
    if (!shareUrl.value) return
    const signal = startRequest()
    navigating.value = true

    try {
      listing.value = await teraboxApi.extract(shareUrl.value, dir, signal)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'CANCELED') return
      throw err
    } finally {
      if (!signal.aborted) navigating.value = false
    }
  }

  function reset() {
    controller?.abort()
    url.value = ''
    shareUrl.value = ''
    status.value = 'idle'
    listing.value = null
    error.value = null
    navigating.value = false
  }

  function saveHistory(link: string, data: ExtractResponse) {
    const item: HistoryItem = {
      url: link,
      title: data.title.replace(/^\/+/, '') || data.surl,
      savedAt: Date.now(),
    }
    // Item terbaru di depan, buang duplikat link yang sama.
    history.value = [item, ...history.value.filter((h) => h.url !== link)].slice(0, HISTORY_LIMIT)
  }

  function removeHistory(link: string) {
    history.value = history.value.filter((h) => h.url !== link)
  }

  function clearHistory() {
    history.value = []
  }

  return {
    url,
    shareUrl,
    status,
    listing,
    error,
    navigating,
    history,
    isLoading,
    extract,
    openFolder,
    reset,
    removeHistory,
    clearHistory,
  }
})
