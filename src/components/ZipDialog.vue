<script setup lang="ts">
import { ref, watch } from 'vue'
import { CircleAlertIcon, FolderDownIcon, Loader2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ApiError, teraboxApi } from '@/lib/api'
import { describeError, type ErrorMessage } from '@/lib/errors'
import { formatBytes } from '@/lib/utils'
import type { ZipInfo, ZipLinks } from '@/types/api'

export interface ZipTarget extends ZipLinks {
  /** Nama folder yang ditampilkan di judul dialog. */
  name: string
}

const props = defineProps<{ target: ZipTarget | null }>()
const open = defineModel<boolean>('open', { required: true })

const loading = ref(false)
const info = ref<ZipInfo | null>(null)
const error = ref<ErrorMessage | null>(null)
let controller: AbortController | null = null

// Setiap kali dialog dibuka: ambil ringkasan ZIP (jumlah file & ukuran).
watch(open, async (isOpen) => {
  controller?.abort()
  if (!isOpen || !props.target) return

  controller = new AbortController()
  loading.value = true
  info.value = null
  error.value = null
  try {
    info.value = await teraboxApi.zipInfo(props.target.zip_info_url, controller.signal)
  } catch (err) {
    if (err instanceof ApiError && err.code === 'CANCELED') return
    error.value = describeError(err)
  } finally {
    loading.value = false
  }
})

function onDownload() {
  // Link <a> tetap jalan (browser mulai download); dialog cukup ditutup.
  open.value = false
  toast.info('Menyiapkan ZIP…', {
    description: 'Download akan muncul di browser dalam beberapa detik.',
  })
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="truncate pr-6">Download "{{ target?.name }}" sebagai ZIP</DialogTitle>
        <DialogDescription>Semua file di folder ini, termasuk subfolder, dikemas jadi satu file .zip.</DialogDescription>
      </DialogHeader>

      <!-- Loading: server sedang menghitung isi folder secara rekursif -->
      <div v-if="loading" class="flex items-center gap-3 rounded-lg border p-4 text-sm text-muted-foreground">
        <Loader2Icon class="size-4 animate-spin" />
        Menghitung isi folder…
      </div>

      <Alert v-else-if="error" variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>{{ error.title }}</AlertTitle>
        <AlertDescription>{{ error.description }}</AlertDescription>
      </Alert>

      <template v-else-if="info">
        <dl class="grid grid-cols-2 gap-3 rounded-lg border p-4 text-sm">
          <div>
            <dt class="text-muted-foreground">Jumlah file</dt>
            <dd class="text-lg font-semibold">{{ info.file_count }}</dd>
          </div>
          <div>
            <dt class="text-muted-foreground">Ukuran ZIP</dt>
            <dd class="text-lg font-semibold">±{{ formatBytes(info.total_size) }}</dd>
          </div>
        </dl>

        <Alert v-if="info.file_count === 0">
          <CircleAlertIcon />
          <AlertTitle>Folder kosong</AlertTitle>
          <AlertDescription>Tidak ada file yang bisa dimasukkan ke ZIP.</AlertDescription>
        </Alert>
        <Alert v-else-if="!info.allowed" variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Terlalu besar untuk ZIP</AlertTitle>
          <AlertDescription>
            Batas server {{ formatBytes(info.max_size) }}. Buka folder ini lalu ZIP subfolder yang lebih kecil.
          </AlertDescription>
        </Alert>
        <p v-else class="text-xs text-muted-foreground">
          ZIP tanpa kompresi. Kalau koneksi terputus, download harus diulang dari awal; untuk file yang sangat
          besar lebih aman download satu per satu.
        </p>
      </template>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">Batal</Button>
        </DialogClose>
        <Button
          v-if="target && info?.allowed && info.file_count > 0"
          as="a"
          :href="target.zip_download_url"
          @click="onDownload"
        >
          <FolderDownIcon />
          Download ZIP
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
