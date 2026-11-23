<script setup lang="ts">
import { computed } from 'vue'
import { CircleAlertIcon, RotateCwIcon } from '@lucide/vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api'
import { describeError } from '@/lib/errors'

const props = defineProps<{ error: unknown }>()
const emit = defineEmits<{ retry: [] }>()

const message = computed(() => describeError(props.error))

// Link salah tidak akan berhasil walau dicoba ulang, jadi tombol disembunyikan.
const canRetry = computed(
  () => !(props.error instanceof ApiError && ['INVALID_URL', 'INVALID_REQUEST', 'SHARE_NOT_FOUND'].includes(props.error.code)),
)
</script>

<template>
  <Alert variant="destructive" role="alert">
    <CircleAlertIcon />
    <AlertTitle>{{ message.title }}</AlertTitle>
    <AlertDescription>
      <p>{{ message.description }}</p>
      <Button v-if="canRetry" variant="outline" size="sm" class="mt-2" @click="emit('retry')">
        <RotateCwIcon />
        Coba lagi
      </Button>
    </AlertDescription>
  </Alert>
</template>
