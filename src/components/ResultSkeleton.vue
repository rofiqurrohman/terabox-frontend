<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <div class="space-y-3" aria-busy="true" aria-label="Memuat daftar file">
    <Card>
      <CardContent class="space-y-3">
        <Skeleton class="h-5 w-2/3" />
        <div class="flex gap-2">
          <Skeleton class="h-5 w-16 rounded-full" />
          <Skeleton class="h-5 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>

    <Card v-for="n in 3" :key="n">
      <CardContent class="flex items-center gap-4">
        <Skeleton class="size-14 shrink-0 rounded-md" />
        <div class="flex-1 space-y-2">
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-3 w-1/3" />
        </div>
        <Skeleton class="hidden h-9 w-28 sm:block" />
      </CardContent>
    </Card>

    <p class="text-center text-sm text-muted-foreground">
      Mengambil data dari TeraBox… folder besar bisa memakan waktu hingga 1 menit.
    </p>
  </div>
</template>
