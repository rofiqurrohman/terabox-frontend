<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import type Hls from 'hls.js/light'

const props = defineProps<{ src: string }>()

const video = useTemplateRef<HTMLVideoElement>('video')
const error = ref<string | null>(null)
let hls: Hls | null = null

/**
 * Browser selain Safari tidak bisa memutar HLS (.m3u8) langsung, jadi pakai
 * hls.js. Library ini di-import saat dibutuhkan saja (lazy) supaya bundle awal kecil.
 * Versi "light" cukup: tanpa subtitle/DRM, tapi tetap mendukung enkripsi AES-128.
 */
async function load(src: string) {
  destroy()
  error.value = null
  const el = video.value
  if (!el) return

  const { default: HlsLib } = await import('hls.js/light')

  if (HlsLib.isSupported()) {
    hls = new HlsLib()
    hls.on(HlsLib.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        error.value = 'Video gagal diputar. Coba download file-nya saja.'
        destroy()
      }
    })
    hls.loadSource(src)
    hls.attachMedia(el)
    return
  }

  // Safari (iPhone/Mac) bisa memutar HLS secara native.
  if (el.canPlayType('application/vnd.apple.mpegurl')) {
    el.src = src
    return
  }

  error.value = 'Browser ini tidak mendukung streaming video.'
}

function destroy() {
  hls?.destroy()
  hls = null
}

onMounted(() => load(props.src))
watch(() => props.src, load)
onBeforeUnmount(destroy)
</script>

<template>
  <div class="relative overflow-hidden rounded-md bg-black">
    <video
      ref="video"
      controls
      autoplay
      playsinline
      class="aspect-video w-full"
      @error="error = 'Video gagal diputar. Coba download file-nya saja.'"
    />
    <div
      v-if="error"
      class="absolute inset-0 grid place-items-center bg-black/80 p-6 text-center text-sm text-white"
      role="alert"
    >
      {{ error }}
    </div>
  </div>
</template>
