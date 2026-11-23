<script setup lang="ts">
import { ref } from 'vue'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import AppHeader from '@/components/AppHeader.vue'
import ErrorState from '@/components/ErrorState.vue'
import ExtractForm from '@/components/ExtractForm.vue'
import RecentHistory from '@/components/RecentHistory.vue'
import ResultSkeleton from '@/components/ResultSkeleton.vue'
import ShareResult from '@/components/ShareResult.vue'
import VideoPlayerDialog from '@/components/VideoPlayerDialog.vue'
import { useExtractStore } from '@/stores/extract'
import type { ShareFile } from '@/types/api'

const store = useExtractStore()

// State player cukup lokal di sini, tidak perlu di store global.
const playerOpen = ref(false)
const playingFile = ref<ShareFile | null>(null)

function openPlayer(file: ShareFile) {
  playingFile.value = file
  playerOpen.value = true
}
</script>

<template>
  <TooltipProvider>
    <div class="flex min-h-dvh flex-col">
      <AppHeader />

      <main class="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-10 sm:py-16">
        <section class="space-y-3 text-center">
          <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Download file TeraBox</h1>
          <p class="text-muted-foreground">
            Tempel link share TeraBox, lalu download atau putar videonya langsung tanpa aplikasi.
          </p>
        </section>

        <ExtractForm />

        <ResultSkeleton v-if="store.isLoading" />
        <ErrorState v-else-if="store.status === 'error'" :error="store.error" @retry="store.extract()" />
        <ShareResult v-else-if="store.listing" :listing="store.listing" @play="openPlayer" />

        <RecentHistory />
      </main>

      <footer class="border-t py-6 text-center text-xs text-muted-foreground">
        File diteruskan langsung dari TeraBox dan tidak disimpan di server.
      </footer>
    </div>

    <VideoPlayerDialog v-model:open="playerOpen" :file="playingFile" />
    <Toaster position="top-center" rich-colors />
  </TooltipProvider>
</template>
