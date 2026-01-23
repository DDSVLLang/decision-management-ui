<template>
  <AppLayout>
    <div class="p-6">
      <div class="mb-6">
        <button
            @click="$router.push('/users')"
            class="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon class="h-5 w-5 mr-2" />
          Zurück zur Benutzerliste
        </button>
      </div>

      <div v-if="user" class="max-w-4xl">
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">
                {{ user.first_name }} {{ user.last_name }}
              </h2>
              <p class="mt-1 text-sm text-gray-500">Benutzer-ID: {{ user.id }}</p>
            </div>
            <button
                @click="$router.push(`/users/${user.id}/edit`)"
                class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
            >
              <PencilIcon class="h-4 w-4 mr-2" />
              Bearbeiten
            </button>
          </div>

          <div class="px-6 py-5">
            <dl class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Vorname</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user.first_name }}</dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-gray-500">Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user.last_name }}</dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-gray-500">E-Mail</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user.email }}</dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-gray-500">Rolle</dt>
                <dd class="mt-1">
                  <span
                      :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    ]"
                  >
                    {{ user.role === 'admin' ? 'Administrator' : 'Benutzer' }}
                  </span>
                </dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-gray-500">Fachbereich</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user.responsibleDepartment || 'Nicht zugewiesen' }}</dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-gray-500">Erstellt am</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDateTime(user.created_at) }}</dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-gray-500">Aktualisiert am</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDateTime(user.updated_at) }}</dd>
              </div>

              <div v-if="user.created_by" class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Erstellt von</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ getCreatorName(user.created_by) }}
                </dd>
              </div>

              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Benutzer-ID (UUID)</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {{ user.id }}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div v-if="authStore.user?.id !== user.id" class="mt-6">
          <button
              @click="handleDelete"
              class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
          >
            <TrashIcon class="h-4 w-4 mr-2" />
            Benutzer löschen
          </button>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-500">Benutzer nicht gefunden</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUsersStore } from '../stores/users'
import AppLayout from '../components/AppLayout.vue'
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const usersStore = useUsersStore()

const userId = computed(() => route.params.id as string)
const user = computed(() => usersStore.users.find(u => u.id === userId.value))

function getCreatorName(creatorId: string): string {
  const creator = usersStore.users.find(u => u.id === creatorId)
  return creator ? `${creator.first_name} ${creator.last_name}` : 'Unbekannt'
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function handleDelete() {
  if (!confirm(`Möchten Sie den Benutzer "${user.value?.first_name} ${user.value?.last_name}" wirklich löschen?`)) {
    return
  }

  if (userId.value) {
    usersStore.deleteUser(userId.value)
    router.push('/users')
  }
}
</script>
