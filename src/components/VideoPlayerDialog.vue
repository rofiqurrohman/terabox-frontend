<script setup lang="ts">
import { DownloadIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import HlsPlayer from '@/components/HlsPlayer.vue'
import { formatBytes } from '@/lib/utils'
import type { ShareFile } from '@/types/api'

defineProps<{ file: ShareFile | null }>()

// defineModel = v-model:open dari parent (Vue 3.4+).
const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle class="truncate pr-6">{{ file?.name }}</DialogTitle>
        <DialogDescription>
          {{ file ? formatBytes(file.size) : '' }} · Kualitas mengikuti TeraBox, bisa butuh beberapa detik untuk mulai.
        </DialogDescription>
      </DialogHeader>

      <!-- Player hanya dibuat saat dialog terbuka; saat ditutup otomatis dihancurkan. -->
      <HlsPlayer v-if="open && file?.stream_proxy_url" :src="file.stream_proxy_url" />

      <DialogFooter v-if="file">
        <Button as="a" :href="file.download_proxy_url">
          <DownloadIcon />
          Download
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
