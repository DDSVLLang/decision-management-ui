<template>
  <AppLayout>
    <div class="p-6">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Benutzer</h2>
        </div>
        <router-link
            to="/users/new"
            class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Neuer Benutzer
        </router-link>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vorname
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                E-Mail
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fachbereich
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rolle
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Erstellt am
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr
                v-for="user in usersStore.users"
                :key="user.id"
                @click="$router.push(`/users/${user.id}`)"
                class="hover:bg-gray-50 cursor-pointer"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ user.last_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.first_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.responsibleDepartment || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span
                      :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    ]"
                  >
                    {{ user.role === 'admin' ? 'Administrator' : 'Benutzer' }}
                  </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex space-x-2" @click.stop>
                  <button
                      @click="$router.push(`/users/${user.id}/edit`)"
                      class="text-primary-600 hover:text-primary-700"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                      @click="deleteUser(user.id)"
                      class="text-error-600 hover:text-error-700"
                      :disabled="user.id === authStore.user?.id"
                      :class="{ 'opacity-50 cursor-not-allowed': user.id === authStore.user?.id }"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-if="usersStore.users.length === 0" class="p-8 text-center text-gray-500">
          Keine Benutzer gefunden.
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useUsersStore } from '../stores/users'
import AppLayout from '../components/AppLayout.vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const usersStore = useUsersStore()

async function deleteUser(userId: string) {
  if (userId === authStore.user?.id) {
    alert('Sie können sich nicht selbst löschen.')
    return
  }

  const user = usersStore.users.find(u => u.id === userId)
  if (!confirm(`Möchten Sie den Benutzer "${user?.first_name} ${user?.last_name}" wirklich löschen?`)) {
    return
  }

  usersStore.deleteUser(userId)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE')
}
</script>
