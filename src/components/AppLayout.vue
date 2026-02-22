<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <div
        class="bg-white shadow-lg transition-all duration-300 ease-in-out"
        :class="isCollapsed ? 'w-16' : 'w-64'"
    >
      <div class="h-full flex flex-col">
        <!-- Header with Logo -->
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <div v-if="!isCollapsed" class="flex items-center space-x-3">
            <img
                src="../assets/langen-logo.svg"
                alt="Langen Logo"
                class="h-12 w-auto"
            />
          </div>

          <!-- Toggle Button -->
          <!--<button
            @click="toggleSidebar"
            class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <ChevronLeftIcon
              class="h-5 w-5 text-gray-600 transition-transform duration-300"
              :class="isCollapsed ? 'rotate-180' : ''"
            />
          </button>  -->
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-2 py-4">
          <div class="space-y-1">
            <router-link
                to="/"
                class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 group"
                :class="$route.name === 'decisions' ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-100'"
            >
              <DocumentTextIcon class="h-5 w-5 flex-shrink-0" :class="isCollapsed ? 'mx-auto' : 'mr-3'" />
              <span v-if="!isCollapsed">Beschlüsse</span>
              <div v-if="isCollapsed" class="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Beschlüsse
              </div>
            </router-link>

            <router-link
                to="/reports"
                class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 group"
                :class="$route.name === 'reports' ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-100'"
            >
              <ChartBarIcon class="h-5 w-5 flex-shrink-0" :class="isCollapsed ? 'mx-auto' : 'mr-3'" />
              <span v-if="!isCollapsed">Berichte</span>
              <div v-if="isCollapsed" class="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Berichte
              </div>
            </router-link>

            <router-link
                v-if="authStore.isAdmin"
                to="/users"
                class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 group"
                :class="$route.path.startsWith('/users') ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-100'"
            >
              <UsersIcon class="h-5 w-5 flex-shrink-0" :class="isCollapsed ? 'mx-auto' : 'mr-3'" />
              <span v-if="!isCollapsed">Benutzer</span>
              <div v-if="isCollapsed" class="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Benutzer
              </div>
            </router-link>

            <router-link
                v-if="authStore.isAdmin"
                to="/management"
                class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 group"
                :class="$route.path.startsWith('/management') ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-100'"
            >
              <CogIcon class="h-5 w-5 flex-shrink-0" :class="isCollapsed ? 'mx-auto' : 'mr-3'" />
              <span v-if="!isCollapsed">Verwaltung</span>
              <div v-if="isCollapsed" class="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Verwaltung
              </div>
            </router-link>
          </div>
        </nav>

        <!-- Footer -->
        <div class="p-3 border-t border-gray-200 space-y-2">
          <div class="flex items-center text-sm text-gray-500">
            <CalendarIcon class="h-4 w-4 flex-shrink-0" :class="isCollapsed ? 'mx-auto' : 'mr-2'" />
            <span v-if="!isCollapsed">Jahr: {{ currentYear }}</span>
          </div>
          <div v-if="authStore.user" class="group relative">
            <button
                @click="handleLogout"
                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-700 hover:bg-red-50 hover:text-red-700"
            >
              <ArrowRightOnRectangleIcon class="h-5 w-5 flex-shrink-0" :class="isCollapsed ? 'mx-auto' : 'mr-3'" />
              <span v-if="!isCollapsed">Abmelden</span>
              <div v-if="isCollapsed" class="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Abmelden
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto">
      <slot />
    </div>

    <!-- Toast Container -->
    <div class="fixed top-6 left-1/2 -translate-x-1/2 z-50 space-y-4 pointer-events-none">
      <div class="pointer-events-auto">
        <Toast
            v-for="toast in toastStore.toasts"
            :key="toast.id"
            :message="toast.message"
            :type="toast.type"
            :duration="toast.duration"
            @close="toastStore.removeToast(toast.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDecisionStore } from '../stores/decisions'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import Toast from './Toast.vue'
import { DocumentTextIcon, ChartBarIcon, CalendarIcon, ArrowRightOnRectangleIcon, UsersIcon, CogIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const store = useDecisionStore()
const authStore = useAuthStore()
const toastStore = useToastStore()
const isCollapsed = ref(false)
const currentYear = store.getCurrentYear()

async function handleLogout() {
  try {
    await authStore.signOut()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>