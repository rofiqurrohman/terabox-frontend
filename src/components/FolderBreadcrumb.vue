<script setup lang="ts">
import { computed } from 'vue'
import { HomeIcon } from '@lucide/vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const props = defineProps<{ dir: string; disabled?: boolean }>()
const emit = defineEmits<{ navigate: [dir: string] }>()

interface Crumb {
  label: string
  path: string
}

// "/Koleksi/Film" → [Koleksi (/Koleksi), Film (/Koleksi/Film)]
const crumbs = computed<Crumb[]>(() => {
  const parts = props.dir.split('/').filter(Boolean)
  return parts.map((label, i) => ({ label, path: '/' + parts.slice(0, i + 1).join('/') }))
})
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList class="flex-wrap">
      <BreadcrumbItem>
        <BreadcrumbPage v-if="crumbs.length === 0" class="flex items-center gap-1">
          <HomeIcon class="size-3.5" />
          Semua file
        </BreadcrumbPage>
        <BreadcrumbLink
          v-else
          as="button"
          type="button"
          class="flex items-center gap-1"
          :disabled="disabled"
          @click="emit('navigate', '/')"
        >
          <HomeIcon class="size-3.5" />
          Semua file
        </BreadcrumbLink>
      </BreadcrumbItem>

      <template v-for="(crumb, i) in crumbs" :key="crumb.path">
        <BreadcrumbSeparator />
        <BreadcrumbItem class="min-w-0">
          <BreadcrumbPage v-if="i === crumbs.length - 1" class="truncate">{{ crumb.label }}</BreadcrumbPage>
          <BreadcrumbLink
            v-else
            as="button"
            type="button"
            class="truncate"
            :disabled="disabled"
            @click="emit('navigate', crumb.path)"
          >
            {{ crumb.label }}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
