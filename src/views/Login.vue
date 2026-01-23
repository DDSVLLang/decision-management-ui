<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-6">
          <img
              src="../assets/langen-logo.svg"
              alt="Langen Logo"
              class="h-36 w-auto"
          />
        </div>
        <h3 class="text-2xl font-normal mb-2 uppercase tracking-[0.25em] text-[#8a8578]">Beschlussüberwachung</h3>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="flex justify-center mb-6">
          <p class="text-gray-600">
            Bitte geben Sie die von Ihrem Administrator bereitgestellten Zugangsdaten ein
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">E-Mail</label>
            <input
                v-model="email"
                type="email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="ihre@email.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Passwort</label>
            <input
                v-model="password"
                type="password"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
            />
          </div>

          <div class="flex items-center space-x-2">
            <input
                v-model="rememberMe"
                type="checkbox"
                id="remember"
                class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label for="remember" class="text-sm text-gray-600">Angemeldet bleiben</label>
          </div>

          <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-800">{{ errorMessage }}</p>
          </div>

          <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Wird verarbeitet...' : 'Anmelden' }}
          </button>
        </form>
      </div>

      <p class="text-center text-gray-500 text-sm mt-8">
        © {{ new Date().getFullYear() }} Beschlussüberwachung. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.signIn(email.value, password.value)
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.message || 'An error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>
