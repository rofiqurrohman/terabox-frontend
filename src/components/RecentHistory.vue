<script setup lang="ts">
import { HistoryIcon, XIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { useExtractStore } from '@/stores/extract'

const store = useExtractStore()
</script>

<template>
  <section v-if="store.history.length" class="space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <HistoryIcon class="size-4" />
        Riwayat terakhir
      </h2>
      <Button variant="ghost" size="xs" @click="store.clearHistory()">Hapus semua</Button>
    </div>

    <ul class="divide-y rounded-lg border">
      <li v-for="item in store.history" :key="item.url" class="flex items-center gap-2 pr-2">
        <button
          type="button"
          class="min-w-0 flex-1 px-4 py-3 text-left hover:bg-accent/50 disabled:opacity-50"
          :disabled="store.isLoading"
          @click="store.extract(item.url)"
        >
          <p class="truncate text-sm font-medium">{{ item.title }}</p>
          <p class="truncate text-xs text-muted-foreground">{{ item.url }}</p>
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          :aria-label="`Hapus ${item.title} dari riwayat`"
          @click="store.removeHistory(item.url)"
        >
          <XIcon />
        </Button>
      </li>
    </ul>
  </section>
</template>
