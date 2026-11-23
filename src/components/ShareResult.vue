<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { FolderDownIcon, FolderOpenIcon, Loader2Icon, SearchIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import FileRow from '@/components/FileRow.vue'
import FolderBreadcrumb from '@/components/FolderBreadcrumb.vue'
import FolderRow from '@/components/FolderRow.vue'
import ZipDialog, { type ZipTarget } from '@/components/ZipDialog.vue'
import { describeError } from '@/lib/errors'
import { formatBytes } from '@/lib/utils'
import { useExtractStore } from '@/stores/extract'
import type { ExtractResponse, ShareFile, ShareFolder } from '@/types/api'

const props = defineProps<{ listing: ExtractResponse }>()
const emit = defineEmits<{ play: [file: ShareFile] }>()

const store = useExtractStore()

// Nama folder yang sedang dibuka; di root pakai judul share.
const currentName = computed(() => {
  const segments = props.listing.dir.split('/').filter(Boolean)
  return segments.at(-1) ?? (props.listing.title.replace(/^\/+/, '') || props.listing.surl)
})

// ---------- pencarian (hanya di folder yang sedang dibuka) ----------
const query = ref('')
const showSearch = computed(() => props.listing.folders.length + props.listing.files.length > 5)
const matches = (name: string) => name.toLowerCase().includes(query.value.trim().toLowerCase())
const folders = computed(() => props.listing.folders.filter((f) => matches(f.name)))
const files = computed(() => props.listing.files.filter((f) => matches(f.name)))
const isEmpty = computed(() => props.listing.folders.length === 0 && props.listing.files.length === 0)

// Pindah folder → kosongkan pencarian.
watch(() => props.listing.dir, () => (query.value = ''))

// ---------- navigasi ----------
async function navigate(dir: string) {
  try {
    await store.openFolder(dir)
  } catch (err) {
    const message = describeError(err)
    toast.error(message.title, { description: message.description })
  }
}

// ---------- ZIP ----------
const zipOpen = ref(false)
const zipTarget = ref<ZipTarget | null>(null)

function openZip(target: ZipTarget) {
  zipTarget.value = target
  zipOpen.value = true
}

function zipFolder(folder: ShareFolder) {
  openZip({ name: folder.name, zip_info_url: folder.zip_info_url, zip_download_url: folder.zip_download_url })
}

function zipCurrent() {
  const { zip_info_url, zip_download_url } = props.listing
  if (zip_info_url && zip_download_url) {
    openZip({ name: currentName.value, zip_info_url, zip_download_url })
  }
}
</script>

<template>
  <section class="space-y-3" aria-live="polite">
    <!-- Header: breadcrumb + info folder + ZIP folder ini -->
    <Card class="py-4">
      <CardContent class="space-y-3 px-4">
        <FolderBreadcrumb :dir="listing.dir" :disabled="store.navigating" @navigate="navigate" />

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-center gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
              <Loader2Icon v-if="store.navigating" class="size-5 animate-spin" />
              <FolderOpenIcon v-else class="size-5" />
            </span>
            <div class="min-w-0 space-y-1">
              <h2 class="truncate font-semibold" :title="currentName">{{ currentName }}</h2>
              <div class="flex flex-wrap gap-1.5">
                <Badge v-if="listing.folder_count" variant="secondary">{{ listing.folder_count }} folder</Badge>
                <Badge variant="secondary">{{ listing.file_count }} file</Badge>
                <Badge v-if="listing.file_count" variant="secondary">{{ formatBytes(listing.total_size) }}</Badge>
                <Badge v-if="listing.cached" variant="outline">Dari cache</Badge>
              </div>
            </div>
          </div>

          <Button
            v-if="listing.zip_download_url"
            class="w-full sm:w-auto"
            :disabled="store.navigating"
            @click="zipCurrent"
          >
            <FolderDownIcon />
            Download folder ini (.zip)
          </Button>
        </div>
      </CardContent>
    </Card>

    <div v-if="showSearch" class="relative">
      <SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="query" placeholder="Cari di folder ini…" aria-label="Cari di folder ini" class="pl-9" />
    </div>

    <p v-if="isEmpty" class="py-6 text-center text-sm text-muted-foreground">Folder ini kosong.</p>
    <p v-else-if="folders.length === 0 && files.length === 0" class="py-6 text-center text-sm text-muted-foreground">
      Tidak ada yang cocok dengan "{{ query }}".
    </p>

    <!-- Saat pindah folder, listing lama tetap tampil tapi diredupkan. -->
    <div class="space-y-3 transition-opacity" :class="{ 'pointer-events-none opacity-60': store.navigating }">
      <ul v-if="folders.length" class="space-y-2">
        <li v-for="folder in folders" :key="folder.path">
          <FolderRow
            :folder="folder"
            :disabled="store.navigating"
            @open="navigate($event.path)"
            @zip="zipFolder"
          />
        </li>
      </ul>

      <ul v-if="files.length" class="space-y-3">
        <li v-for="file in files" :key="file.fs_id">
          <FileRow :file="file" @play="emit('play', $event)" />
        </li>
      </ul>
    </div>

    <ZipDialog v-model:open="zipOpen" :target="zipTarget" />
  </section>
</template>
