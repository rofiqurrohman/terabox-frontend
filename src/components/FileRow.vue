<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import { CheckIcon, CopyIcon, DownloadIcon, PlayIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { categoryInfo } from '@/lib/file-category'
import { formatBytes, formatDate } from '@/lib/utils'
import type { ShareFile } from '@/types/api'

const props = defineProps<{ file: ShareFile }>()
const emit = defineEmits<{ play: [file: ShareFile] }>()

const category = computed(() => categoryInfo(props.file.category))
const thumbnail = computed(() => props.file.thumbs.url3 || props.file.thumbs.url2 || props.file.thumbs.url1)
const thumbnailFailed = ref(false)

const { copy, copied } = useClipboard({ legacy: true, copiedDuring: 2000 })

async function copyLink() {
  await copy(props.file.download_proxy_url)
  toast.success('Link download disalin')
}
</script>

<template>
  <Card class="py-4">
    <CardContent class="flex flex-col gap-4 px-4 sm:flex-row sm:items-center">
      <div class="flex min-w-0 flex-1 items-center gap-4">
        <!-- Thumbnail; kalau gagal dimuat (diblokir TeraBox) tampilkan ikon kategori. -->
        <div class="grid size-14 shrink-0 place-items-center overflow-hidden rounded-md bg-muted text-muted-foreground">
          <img
            v-if="thumbnail && !thumbnailFailed"
            :src="thumbnail"
            :alt="file.name"
            referrerpolicy="no-referrer"
            loading="lazy"
            class="size-full object-cover"
            @error="thumbnailFailed = true"
          >
          <component :is="category.icon" v-else class="size-6" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate font-medium" :title="file.name">{{ file.name }}</p>
          <p class="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <span>{{ category.label }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ formatBytes(file.size) }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ formatDate(file.server_mtime) }}</span>
          </p>
        </div>
      </div>

      <div class="flex gap-2">
        <Button v-if="file.stream_proxy_url" variant="secondary" class="flex-1 sm:flex-none" @click="emit('play', file)">
          <PlayIcon />
          Putar
        </Button>

        <!-- Link biasa: browser langsung download karena server mengirim Content-Disposition: attachment -->
        <Button as="a" :href="file.download_proxy_url" class="flex-1 sm:flex-none">
          <DownloadIcon />
          Download
        </Button>

        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="outline" size="icon" aria-label="Salin link download" @click="copyLink">
              <CheckIcon v-if="copied" />
              <CopyIcon v-else />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Salin link download</TooltipContent>
        </Tooltip>
      </div>
    </CardContent>
  </Card>
</template>
