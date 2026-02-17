<template>
  <AppLayout>
    <div class="p-6">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-normal tracking-[0.08em] text-gray-600">Benutzer</h2>
        </div>
        <router-link
            to="/users/new"
            class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Neuer Benutzer
        </router-link>
      </div>

      <div v-if="usersStore.loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <div v-else-if="usersStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ usersStore.error }}</p>
      </div>

      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
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
                Organisationseinheit
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
                :class="[
                  'hover:bg-gray-50 cursor-pointer',
                  !user.active ? 'opacity-40' : ''
                ]"
            >
              <td :class="[
                'px-6 py-4 whitespace-nowrap text-sm font-medium',
                !user.active ? 'text-gray-500' : 'text-gray-900'
              ]">
                {{ user.lastName }}
              </td>
              <td :class="[
                'px-6 py-4 whitespace-nowrap text-sm',
                !user.active ? 'text-gray-500' : 'text-gray-900'
              ]">
                {{ user.firstName }}
              </td>
              <td :class="[
                'px-6 py-4 whitespace-nowrap text-sm',
                !user.active ? 'text-gray-500' : 'text-gray-900'
              ]">
                {{ user.email }}
              </td>
              <td :class="[
                'px-6 py-4 whitespace-nowrap text-sm',
                !user.active ? 'text-gray-500' : 'text-gray-900'
              ]">
                {{ user.department?.name || user.responsibleDepartment || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                      :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      !user.active ? 'bg-gray-100 text-gray-600' :
                      user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    ]"
                  >
                    {{ user.role === 'admin' ? 'Administrator' : 'Benutzer' }}
                  </span>
              </td>
              <td :class="[
                'px-6 py-4 whitespace-nowrap text-sm',
                !user.active ? 'text-gray-500' : 'text-gray-900'
              ]">
                {{ formatDate(user.createdAt) }}
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
                      @click="openDeleteDialog(user.id)"
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

      <TransitionRoot appear :show="showDeleteDialog" as="template">
        <Dialog as="div" @close="closeDeleteDialog" class="relative z-50">
          <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0"
              enter-to="opacity-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100"
              leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-black bg-opacity-25" />
          </TransitionChild>

          <div class="fixed inset-0 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                  as="template"
                  enter="duration-300 ease-out"
                  enter-from="opacity-0 scale-95"
                  enter-to="opacity-100 scale-100"
                  leave="duration-200 ease-in"
                  leave-from="opacity-100 scale-100"
                  leave-to="opacity-0 scale-95"
              >
                <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                    Benutzer löschen
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Sind Sie sicher, dass Sie "{{ userToDelete?.firstName }} {{ userToDelete?.lastName }}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                    </p>
                  </div>

                  <div v-if="deleteError" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p class="text-sm text-red-800">{{ deleteError }}</p>
                  </div>

                  <div class="mt-4 flex justify-end space-x-2">
                    <button
                        type="button"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        @click="closeDeleteDialog"
                    >
                      Abbrechen
                    </button>
                    <button
                        type="button"
                        class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        @click="confirmDelete"
                    >
                      Löschen
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUsersStore } from '../stores/users'
import { UsersApi } from '../lib/usersApi'
import AppLayout from '../components/AppLayout.vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

const authStore = useAuthStore()
const usersStore = useUsersStore()

const showDeleteDialog = ref(false)
const userToDelete = ref<{ id: string; firstName: string; lastName: string } | null>(null)
const deleteError = ref('')

onMounted(() => {
  usersStore.fetchUsers()
})

function openDeleteDialog(userId: string) {
  if (userId === authStore.user?.id) {
    deleteError.value = 'Sie können sich nicht selbst löschen.'
    return
  }

  const user = usersStore.users.find(u => u.id === userId)
  if (user) {
    userToDelete.value = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName
    }
    deleteError.value = ''
    showDeleteDialog.value = true
  }
}

function closeDeleteDialog() {
  showDeleteDialog.value = false
  userToDelete.value = null
  deleteError.value = ''
}

async function confirmDelete() {
  if (!userToDelete.value) return

  try {
    await UsersApi.deleteUser(userToDelete.value.id)
    await usersStore.fetchUsers()
    closeDeleteDialog()
  } catch (error: any) {
    console.error('Error deleting user:', error)
    deleteError.value = error.message || 'Fehler beim Löschen des Benutzers'
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE')
}
</script>
