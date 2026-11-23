<script setup lang="ts">
import { ChevronRightIcon, FolderDownIcon, FolderIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatDate } from '@/lib/utils'
import type { ShareFolder } from '@/types/api'

defineProps<{ folder: ShareFolder; disabled?: boolean }>()
const emit = defineEmits<{
  open: [folder: ShareFolder]
  zip: [folder: ShareFolder]
}>()
</script>

<template>
  <Card class="flex-row items-center gap-0 overflow-hidden py-0">
    <!-- Seluruh area kiri bisa diklik untuk membuka folder. -->
    <button
      type="button"
      class="flex min-w-0 flex-1 items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-accent/50 disabled:pointer-events-none disabled:opacity-60"
      :disabled="disabled"
      @click="emit('open', folder)"
    >
      <span class="grid size-10 shrink-0 place-items-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <FolderIcon class="size-5" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate font-medium" :title="folder.name">{{ folder.name }}</span>
        <span class="block text-sm text-muted-foreground">Folder · {{ formatDate(folder.server_mtime) }}</span>
      </span>
      <ChevronRightIcon class="size-4 shrink-0 text-muted-foreground" />
    </button>

    <div class="pr-3 pl-1">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="outline"
            size="sm"
            :disabled="disabled"
            :aria-label="`Download folder ${folder.name} sebagai ZIP`"
            @click="emit('zip', folder)"
          >
            <FolderDownIcon />
            <span class="hidden sm:inline">ZIP</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download folder ini sebagai ZIP</TooltipContent>
      </Tooltip>
    </div>
  </Card>
</template>
