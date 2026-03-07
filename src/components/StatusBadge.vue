<template>
  <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      :class="statusClasses"
  >
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: string
}

const props = defineProps<Props>()

const statusClasses = computed(() => {
  const status = props.status.toLowerCase()
  switch (status) {
    case 'pending':
      return 'bg-warning-100 text-warning-800'
    case 'in-progress':
    case 'in_progress':
      return 'bg-primary-100 text-primary-800'
    case 'completed':
      return 'bg-success-100 text-success-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const statusText = computed(() => {
  const status = props.status.toLowerCase()
  switch (status) {
    case 'in-progress':
    case 'in_progress':
      return 'In Bearbeitung'
    case 'completed':
      return 'Abgeschlossen'
    default:
      return props.status
  }
})
</script>