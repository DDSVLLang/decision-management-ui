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
            <label class="block text-sm font-medium text-gray-700 mb-1">Organisationseinheit</label>
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
        <div v-if="authStore.isAdmin" class="mt-4 pt-4 border-t border-gray-200">
          <label class="flex items-center cursor-pointer">
            <input
                v-model="showDeletedFilter"
                type="checkbox"
                class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span class="ml-2 text-sm font-medium text-gray-700">Gelöschte Beschlüsse anzeigen</span>
          </label>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="store.loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="store.error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ store.error }}</p>
      </div>

      <!-- Decisions Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
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
                OE
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
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span
                      v-for="dept in decision.departments"
                      :key="dept.shortName"
                      :class="[
                        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                        decision.deleted ? 'bg-gray-200 text-gray-500' : 'bg-primary-100 text-primary-800'
                      ]"
                  >
                    {{ dept.shortName }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div v-if="!decision.deleted" class="flex space-x-2">
                  <button
                      @click.stop="$router.push(`/decisions/${decision.id}/edit`)"
                      class="text-primary-600 hover:text-primary-700"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                      v-if="authStore.isAdmin"
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

        <!-- Pagination -->
        <div v-if="filteredDecisions.length > 0" class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
                @click="previousPage"
                :disabled="store.currentPage === 0"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zurück
            </button>
            <button
                @click="nextPage"
                :disabled="store.currentPage >= store.totalPages - 1"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Weiter
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Zeige
                <span class="font-medium">{{ store.currentPage * store.pageSize + 1 }}</span>
                bis
                <span class="font-medium">{{ Math.min((store.currentPage + 1) * store.pageSize, store.totalElements) }}</span>
                von
                <span class="font-medium">{{ store.totalElements }}</span>
                Ergebnissen
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                    @click="previousPage"
                    :disabled="store.currentPage === 0"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon class="h-5 w-5" />
                </button>
                <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Seite {{ store.currentPage + 1 }} von {{ store.totalPages }}
                </span>
                <button
                    @click="nextPage"
                    :disabled="store.currentPage >= store.totalPages - 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon class="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useDecisionStore, type Decision } from '../stores/decisions'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/AppLayout.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

const store = useDecisionStore()
const authStore = useAuthStore()

const searchTerm = ref('')
const statusFilter = ref('')
const committeeFilter = ref('')
const departmentFilter = ref('')
const topicFilter = ref('')
const showDeletedFilter = ref(false)
const showDeleteDialog = ref(false)
const itemToDelete = ref<Decision | null>(null)

const decisions = computed(() => store.decisions)
const committees = computed(() => store.committees)
const departments = computed(() => store.departments)
const topics = computed(() => store.topics)

const filteredDecisions = computed(() => {
  let filtered = decisions.value

  if (!authStore.isAdmin) {
    filtered = filtered.filter(d => !d.deleted)

    const userDepartment = authStore.user?.responsibleDepartment
    if (userDepartment) {
      filtered = filtered.filter(d => d.responsibleDepartments.includes(userDepartment))
    }
  } else {
    if (!showDeletedFilter.value) {
      filtered = filtered.filter(d => !d.deleted)
    }
  }

  return filtered
})

function performSearch() {
  const params: any = {
    page: 0,
    size: 20
  }

  if (statusFilter.value) {
    params.status = statusFilter.value
  }
  if (committeeFilter.value) {
    params.committee = committeeFilter.value
  }
  if (departmentFilter.value) {
    params.department = departmentFilter.value
  }
  if (topicFilter.value) {
    params.topic = topicFilter.value
  }
  if (searchTerm.value && searchTerm.value.length >= 3) {
    params.keyword = searchTerm.value
  }

  store.fetchDecisions(params)
}

onMounted(async () => {
  if (!authStore.isAdmin) {
    statusFilter.value = 'in-progress'
  }
  await store.loadManagementData()
  performSearch()
})

watch([statusFilter, committeeFilter, departmentFilter, topicFilter], () => {
  performSearch()
})

watch(searchTerm, () => {
  if (searchTerm.value.length >= 3 || searchTerm.value.length === 0) {
    performSearch()
  }
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

async function confirmDelete() {
  if (itemToDelete.value) {
    try {
      await store.deleteDecision(itemToDelete.value.id)
      closeDeleteDialog()
    } catch (err) {
      console.error('Failed to delete decision:', err)
    }
  }
}

function goToPage(page: number) {
  const params: any = {
    page,
    size: 20
  }

  if (statusFilter.value) {
    params.status = statusFilter.value
  }
  if (committeeFilter.value) {
    params.committee = committeeFilter.value
  }
  if (departmentFilter.value) {
    params.department = departmentFilter.value
  }
  if (topicFilter.value) {
    params.topic = topicFilter.value
  }
  if (searchTerm.value && searchTerm.value.length >= 3) {
    params.keyword = searchTerm.value
  }

  store.fetchDecisions(params)
}

function previousPage() {
  if (store.currentPage > 0) {
    goToPage(store.currentPage - 1)
  }
}

function nextPage() {
  if (store.currentPage < store.totalPages - 1) {
    goToPage(store.currentPage + 1)
  }
}
</script>