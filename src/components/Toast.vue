<template>
  <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
  >
    <div
        v-if="show"
        :class="[
        'max-w-md w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden',
        typeClasses
      ]"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <CheckCircleIcon v-if="type === 'success'" class="h-6 w-6" />
            <XCircleIcon v-if="type === 'error'" class="h-6 w-6" />
            <InformationCircleIcon v-if="type === 'info'" class="h-6 w-6" />
          </div>
          <div class="ml-3 flex-1 pt-0.5">
            <p class="text-sm font-medium whitespace-nowrap">{{ message }}</p>
          </div>
          <div class="ml-4 flex flex-shrink-0">
            <button
                @click="close"
                class="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                :class="buttonClasses"
            >
              <span class="sr-only">Schließen</span>
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 5000
})

const emit = defineEmits<{
  close: []
}>()

const show = ref(false)
let timeoutId: number | null = null

const typeClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-50 text-green-800 border border-green-200'
    case 'error':
      return 'bg-red-50 text-red-800 border border-red-200'
    case 'info':
      return 'bg-blue-50 text-blue-800 border border-blue-200'
    default:
      return 'bg-gray-50 text-gray-800 border border-gray-200'
  }
})

const buttonClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-700 hover:text-green-900 focus:ring-green-500'
    case 'error':
      return 'text-red-700 hover:text-red-900 focus:ring-red-500'
    case 'info':
      return 'text-blue-700 hover:text-blue-900 focus:ring-blue-500'
    default:
      return 'text-gray-700 hover:text-gray-900 focus:ring-gray-500'
  }
})

function close() {
  show.value = false
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  setTimeout(() => {
    emit('close')
  }, 200)
}

onMounted(() => {
  show.value = true
  if (props.duration > 0) {
    timeoutId = window.setTimeout(() => {
      close()
    }, props.duration)
  }
})

watch(() => props.message, () => {
  show.value = true
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  if (props.duration > 0) {
    timeoutId = window.setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>
