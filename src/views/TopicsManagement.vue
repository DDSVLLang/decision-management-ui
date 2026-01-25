<template>
  <AppLayout>
    <div class="p-6">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <button
              @click="$router.back()"
              class="text-gray-600 hover:text-gray-900 flex items-center mb-2"
          >
            <ArrowLeftIcon class="h-5 w-5 mr-2" />
            Zurück
          </button>
          <h2 class="text-2xl font-bold text-gray-900">Themen verwalten</h2>
        </div>
        <button
            @click="openAddDialog"
            class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Neues Thema
        </button>
      </div>

      <div v-if="store.error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
        {{ store.error }}
      </div>

      <div class="bg-white rounded-lg shadow">
        <div v-if="store.loading" class="p-8 text-center text-gray-500">
          Laden...
        </div>
        <div v-else-if="store.topics.length === 0" class="p-8 text-center text-gray-500">
          Keine Themen vorhanden. Klicken Sie auf "Neues Thema", um eines hinzuzufügen.
        </div>
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Beschreibung
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Erstellt am
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aktionen
            </th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="topic in store.topics" :key="topic.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ topic.name }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ topic.description || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(topic.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button
                  @click="openEditDialog(topic)"
                  class="text-primary-600 hover:text-primary-900"
              >
                <PencilIcon class="h-5 w-5" />
              </button>
              <button
                  @click="openDeleteDialog(topic)"
                  class="text-red-600 hover:text-red-900"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <TransitionRoot appear :show="showDialog" as="template">
        <Dialog as="div" @close="closeDialog" class="relative z-50">
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
                <DialogPanel class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                    {{ dialogMode === 'add' ? 'Neues Thema hinzufügen' : 'Thema bearbeiten' }}
                  </DialogTitle>

                  <div class="mt-4 space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Name <span class="text-red-500">*</span>
                      </label>
                      <input
                          v-model="formName"
                          type="text"
                          placeholder="z.B. Radverkehrskonzept"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Beschreibung
                      </label>
                      <textarea
                          v-model="formDescription"
                          rows="3"
                          placeholder="z.B. Ausbau und Förderung des Radverkehrs in der Stadt"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      ></textarea>
                    </div>
                  </div>

                  <div class="mt-6 flex justify-end space-x-2">
                    <button
                        type="button"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        @click="closeDialog"
                    >
                      Abbrechen
                    </button>
                    <button
                        type="button"
                        class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        @click="saveItem"
                        :disabled="!formName.trim()"
                    >
                      {{ dialogMode === 'add' ? 'Hinzufügen' : 'Speichern' }}
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>

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
                    Thema löschen
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Sind Sie sicher, dass Sie "{{ itemToDelete?.name }}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                    </p>
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
import { useManagementStore, type Topic } from '../stores/management'
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import AppLayout from '../components/AppLayout.vue'

const store = useManagementStore()

const showDialog = ref(false)
const showDeleteDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const formName = ref('')
const formDescription = ref('')
const editingItem = ref<Topic | null>(null)
const itemToDelete = ref<Topic | null>(null)

onMounted(() => {
  store.loadTopics()
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE')
}

function openAddDialog() {
  dialogMode.value = 'add'
  formName.value = ''
  formDescription.value = ''
  editingItem.value = null
  showDialog.value = true
}

function openEditDialog(topic: Topic) {
  dialogMode.value = 'edit'
  formName.value = topic.name
  formDescription.value = topic.description || ''
  editingItem.value = topic
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  formName.value = ''
  formDescription.value = ''
  editingItem.value = null
}

async function saveItem() {
  if (!formName.value.trim()) return

  try {
    if (dialogMode.value === 'add') {
      await store.addTopic(
          formName.value.trim(),
          formDescription.value.trim() || undefined
      )
    } else if (editingItem.value) {
      await store.updateTopic(
          editingItem.value.id,
          formName.value.trim(),
          formDescription.value.trim() || undefined
      )
    }
    closeDialog()
  } catch (error) {
    console.error('Error saving topic:', error)
  }
}

function openDeleteDialog(topic: Topic) {
  itemToDelete.value = topic
  showDeleteDialog.value = true
}

function closeDeleteDialog() {
  showDeleteDialog.value = false
  itemToDelete.value = null
}

async function confirmDelete() {
  if (!itemToDelete.value) return

  try {
    await store.deleteTopic(itemToDelete.value.id)
    closeDeleteDialog()
  } catch (error) {
    console.error('Error deleting topic:', error)
  }
}
</script>
