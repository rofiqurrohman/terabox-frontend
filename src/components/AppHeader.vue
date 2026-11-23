<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { CloudDownloadIcon, MoonIcon, SunIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'

// useDark otomatis menambah/menghapus class "dark" di <html> dan menyimpan pilihan di localStorage.
const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <header class="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
    <div class="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
      <a href="/" class="flex items-center gap-2 font-semibold tracking-tight">
        <span class="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
          <CloudDownloadIcon class="size-4" />
        </span>
        TeraBox Downloader
      </a>

      <Button
        variant="ghost"
        size="icon"
        :aria-label="isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'"
        @click="toggleDark()"
      >
        <SunIcon v-if="isDark" />
        <MoonIcon v-else />
      </Button>
    </div>
  </header>
</template>
