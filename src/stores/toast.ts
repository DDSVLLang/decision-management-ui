import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
    id: number
    message: string
    type: 'success' | 'error' | 'info'
    duration: number
}

export const useToastStore = defineStore('toast', () => {
    const toasts = ref<Toast[]>([])
    let nextId = 1

    function showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 5000) {
        const id = nextId++
        const toast: Toast = {
            id,
            message,
            type,
            duration
        }
        toasts.value.push(toast)
    }

    function removeToast(id: number) {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index !== -1) {
            toasts.value.splice(index, 1)
        }
    }

    function success(message: string, duration = 5000) {
        showToast(message, 'success', duration)
    }

    function error(message: string, duration = 5000) {
        showToast(message, 'error', duration)
    }

    function info(message: string, duration = 5000) {
        showToast(message, 'info', duration)
    }

    return {
        toasts,
        showToast,
        removeToast,
        success,
        error,
        info
    }
})