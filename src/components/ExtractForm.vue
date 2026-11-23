<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRightIcon, ClipboardPasteIcon, LinkIcon, Loader2Icon, XIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api'
import { useExtractStore } from '@/stores/extract'

const store = useExtractStore()

const isInvalid = computed(
  () => store.error instanceof ApiError && ['INVALID_URL', 'INVALID_REQUEST'].includes(store.error.code),
)

// Clipboard API hanya ada di HTTPS / localhost dan browser yang mendukung.
const canPaste = typeof navigator !== 'undefined' && !!navigator.clipboard?.readText

async function pasteAndExtract() {
  try {
    const text = await navigator.clipboard.readText()
    if (!text.trim()) {
      toast.info('Clipboard kosong')
      return
    }
    await store.extract(text)
  } catch {
    toast.error('Tidak bisa membaca clipboard', {
      description: 'Izinkan akses clipboard, atau tempel link secara manual (Ctrl+V).',
    })
  }
}
</script>

<template>
  <form class="space-y-2" @submit.prevent="store.extract()">
    <div class="flex flex-col gap-2 sm:flex-row">
      <div class="relative flex-1">
        <LinkIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="store.url"
          type="text"
          inputmode="url"
          autocomplete="off"
          spellcheck="false"
          placeholder="Tempel link TeraBox, contoh: terabox.com/s/1xxxxx"
          aria-label="Link share TeraBox"
          :aria-invalid="isInvalid || undefined"
          :disabled="store.isLoading"
          class="h-11 pr-9 pl-9"
        />
        <button
          v-if="store.url && !store.isLoading"
          type="button"
          class="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Hapus link"
          @click="store.reset()"
        >
          <XIcon class="size-4" />
        </button>
      </div>

      <div class="flex gap-2">
        <Button
          v-if="canPaste"
          type="button"
          variant="outline"
          size="lg"
          class="h-11 flex-1 sm:flex-none"
          :disabled="store.isLoading"
          @click="pasteAndExtract"
        >
          <ClipboardPasteIcon />
          Tempel
        </Button>
        <Button type="submit" size="lg" class="h-11 flex-1 sm:flex-none" :disabled="store.isLoading">
          <Loader2Icon v-if="store.isLoading" class="animate-spin" />
          <ArrowRightIcon v-else />
          {{ store.isLoading ? 'Memproses…' : 'Proses' }}
        </Button>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">
      Mendukung terabox.com, 1024tera.com, terasharelink.com, dan domain TeraBox lainnya. Link folder juga bisa.
    </p>
  </form>
</template>
