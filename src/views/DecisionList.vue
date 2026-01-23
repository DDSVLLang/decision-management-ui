<template>
  <AppLayout>
    <div class="p-6">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Beschlüsse</h2>
        </div>
        <router-link
            v-if="authStore.isAdmin"
            to="/decisions/new"
            class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Neuer Beschluss
        </router-link>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow mb-6 p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Suchbegriff</label>
            <input
                v-model="searchTerm"
                type="text"
                placeholder="Titel, Beschreibung..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
                v-model="statusFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Alle</option>
              <option value="pending">Ausstehend</option>
              <option value="in-progress">In Bearbeitung</option>
              <option value="completed">Abgeschlossen</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Gremium</label>
            <select
                v-model="committeeFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Alle</option>
              <option v-for="committee in committees" :key="committee" :value="committee">
                {{ committee }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fachbereich</label>
            <select
                v-model="departmentFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Alle</option>
              <option v-for="department in departments" :key="department" :value="department">
                {{ department }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Thema</label>
            <select
                v-model="topicFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Alle</option>
              <option v-for="topic in topics" :key="topic" :value="topic">
                {{ topic }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Decisions Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Titel
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gremium
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fachbereich
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr
                v-for="decision in filteredDecisions"
                :key="decision.id"
                :class="[
                'hover:bg-gray-50 cursor-pointer transition-colors duration-200',
                decision.deleted ? 'opacity-50 bg-gray-100' : ''
              ]"
                @click="$router.push(`/decisions/${decision.id}`)"
            >
              <td :class="['px-6 py-4 whitespace-nowrap text-sm font-medium', decision.deleted ? 'text-gray-400' : 'text-gray-900']">
                {{ decision.id }}
              </td>
              <td :class="['px-6 py-4 text-sm', decision.deleted ? 'text-gray-400' : 'text-gray-900']">
                <div class="max-w-xs truncate">
                  {{ decision.title }}
                  <span v-if="decision.deleted" class="ml-2 text-xs font-medium text-gray-500">(gelöscht)</span>
                </div>
              </td>
              <td :class="['px-6 py-4 whitespace-nowrap text-sm', decision.deleted ? 'text-gray-400' : 'text-gray-900']">
                {{ decision.decisionBody }}
              </td>
              <td :class="['px-6 py-4 whitespace-nowrap text-sm', decision.deleted ? 'text-gray-400' : 'text-gray-900']">
                {{ formatDate(decision.decisionDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <StatusBadge :status="decision.status" />
              </td>
              <td :class="['px-6 py-4 whitespace-nowrap text-sm', decision.deleted ? 'text-gray-400' : 'text-gray-900']">
                {{ decision.responsibleDepartment }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div v-if="authStore.isAdmin && !decision.deleted" class="flex space-x-2">
                  <button
                      @click.stop="$router.push(`/decisions/${decision.id}/edit`)"
                      class="text-primary-600 hover:text-primary-700"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                      @click.stop="openDeleteDialog(decision)"
                      class="text-error-600 hover:text-error-700"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
                <div v-else-if="decision.deleted" class="text-gray-400">-</div>
                <div v-else class="text-gray-400">-</div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredDecisions.length === 0" class="p-8 text-center text-gray-500">
          Keine Beschlüsse gefunden.
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
                    Beschluss löschen
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Sind Sie sicher, dass Sie den Beschluss "{{ itemToDelete?.title }}" als gelöscht markieren möchten? Der Beschluss wird weiterhin im System vorhanden sein, aber für normale Benutzer nicht mehr sichtbar.
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
import { ref, computed } from 'vue'
import { useDecisionStore, type Decision } from '../stores/decisions'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/AppLayout.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

const store = useDecisionStore()
const authStore = useAuthStore()

const searchTerm = ref('')
const statusFilter = ref('')
const committeeFilter = ref('')
const departmentFilter = ref('')
const topicFilter = ref('')
const showDeleteDialog = ref(false)
const itemToDelete = ref<Decision | null>(null)

const decisions = computed(() => store.decisions)
const committees = computed(() => store.committees)
const departments = computed(() => store.departments)
const topics = computed(() => store.topics)

const filteredDecisions = computed(() => {
  let filtered = decisions.value

  // Filter out deleted decisions for non-admin users
  // And filter by department for non-admin users
  if (!authStore.isAdmin) {
    filtered = filtered.filter(d => !d.deleted)

    // Users can only see decisions from their own department
    if (authStore.user?.responsibleDepartment) {
      filtered = filtered.filter(d => d.responsibleDepartment === authStore.user!.responsibleDepartment)
    }
  }

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(term) ||
        d.content.toLowerCase().includes(term)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(d => d.status === statusFilter.value)
  }

  if (committeeFilter.value) {
    filtered = filtered.filter(d => d.decisionBody === committeeFilter.value)
  }

  if (departmentFilter.value) {
    filtered = filtered.filter(d => d.responsibleDepartment === departmentFilter.value)
  }

  if (topicFilter.value) {
    filtered = filtered.filter(d => d.topic === topicFilter.value)
  }

  return filtered
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE')
}

function openDeleteDialog(decision: Decision) {
  itemToDelete.value = decision
  showDeleteDialog.value = true
}

function closeDeleteDialog() {
  showDeleteDialog.value = false
  itemToDelete.value = null
}

function confirmDelete() {
  if (itemToDelete.value) {
    store.deleteDecision(itemToDelete.value.id)
    closeDeleteDialog()
  }
}
</script>