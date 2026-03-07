<template>
  <AppLayout>
    <div v-if="isLoading" class="p-6">
      <div class="text-center">
        <p class="text-gray-500">Lade Beschluss...</p>
      </div>
    </div>
    <div v-else-if="!hasAccess" class="p-6">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 class="text-xl font-bold text-red-900 mb-2">Zugriff verweigert</h2>
        <p class="text-red-700 mb-4">Sie haben keine Berechtigung, diesen Beschluss zu sehen.</p>
        <button
            @click="$router.push('/decisions')"
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Zurück zur Übersicht
        </button>‚
      </div>
    </div>
    <div class="p-6" v-else-if="decision">
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
              @click="$router.back()"
              class="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <ArrowLeftIcon class="h-5 w-5 mr-2" />
            Zurück
          </button>
          <h2 class="text-2xl font-bold text-gray-900">Beschluss</h2>
          <StatusBadge :status="decision.status" />
          <span
              v-if="authStore.isAdmin && decision.canBeCompleted && decision.status !== 'completed'"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            Beschluss kann abgeschlossen werden
          </span>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Admin Status Control -->
          <Menu v-if="authStore.isAdmin" as="div" class="relative inline-block text-left">
            <div>
              <MenuButton class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                {{ decision.status === 'completed' ? 'Abgeschlossen' : 'In Bearbeitung' }}
                <ChevronDownIcon class="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
              </MenuButton>
            </div>

            <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
              <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div class="py-1">
                  <MenuItem v-slot="{ active }">
                    <button
                        @click="setCompleted(true)"
                        :class="[
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      decision.status === 'completed' ? 'bg-success-50 text-success-800' : '',
                      'group flex items-center px-4 py-2 text-sm w-full text-left'
                    ]"
                    >
                      <div class="w-2 h-2 rounded-full bg-success-500 mr-3"></div>
                      Abgeschlossen
                      <CheckIcon v-if="decision.status === 'completed'" class="ml-auto h-4 w-4 text-success-600" />
                    </button>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <button
                        @click="setCompleted(false)"
                        :class="[
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      decision.status !== 'completed' ? 'bg-primary-50 text-primary-800' : '',
                      'group flex items-center px-4 py-2 text-sm w-full text-left'
                    ]"
                    >
                      <div class="w-2 h-2 rounded-full bg-primary-500 mr-3"></div>
                      Wieder in Bearbeitung
                      <CheckIcon v-if="decision.status !== 'completed'" class="ml-auto h-4 w-4 text-primary-600" />
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </transition>
          </Menu>
          <router-link
              v-if="authStore.isAdmin"
              :to="`/decisions/${decision.id}/edit`"
              class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
          >
            <PencilIcon class="h-4 w-4 mr-2" />
            Bearbeiten
          </router-link>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Information -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Grundinformationen</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Beschlussgremium</label>
                <p class="mt-1 text-sm text-gray-900">{{ decision.decisionBody }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Beschlussdatum</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(decision.decisionDate) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Drucksache</label>
                <p class="mt-1 text-sm text-gray-900">{{ decision.printMatter }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Zuständige Organisationseinheiten</label>
                <div class="mt-1 flex flex-wrap gap-2">
                  <span
                      v-for="dept in decision.responsibleDepartments"
                      :key="dept"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {{ dept }}
                  </span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Thema</label>
                <p class="mt-1 text-sm text-gray-900">{{ decision.topic === 'UNKNOWN' ? 'Unbekannt'  : decision.topic }}</p>
              </div>
              <div v-if="decision.dueDate">
                <label class="block text-sm font-medium text-gray-700">Fälligkeit</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(decision.dueDate) }}</p>
              </div>
            </div>
          </div>

          <!-- Title and Description -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Betreff</h3>
            <p class="text-gray-900">{{ decision.title }}</p>
          </div>

          <!-- Content -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Beschlusstext</h3>
            <div class="prose max-w-none">
              <pre class="whitespace-pre-wrap text-sm text-gray-900">{{ decision.content }}</pre>
            </div>
          </div>

          <!-- Implementation Status -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Umsetzungsstand</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-medium text-gray-900 mb-2">Vorherige Berichtsinhalte</h4>
                <div class="border rounded-lg bg-gray-50 max-h-[400px] overflow-y-auto">
                  <div v-if="previousReports.length === 0" class="p-4">
                    <p class="text-sm text-gray-700">Keine Einträge vorhanden</p>
                  </div>
                  <div v-else class="divide-y divide-gray-200">
                    <div
                        v-for="report in previousReports"
                        :key="report.id"
                        class="p-4"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <h5 class="font-medium text-sm text-gray-900">{{ report.year }}</h5>
                        <span class="text-xs text-gray-500">{{ formatDate(report.createdAt) }}</span>
                      </div>
                      <p class="text-sm text-gray-700 mb-2">{{ report.content }}</p>
                      <div v-if="report.expectedCompletionQuarter" class="text-xs text-gray-600">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div class="flex items-center space-x-2 mb-2">
                  <h4 class="font-medium text-gray-900">Bericht zum Jahr</h4>
                  <select
                      v-model="selectedYear"
                      class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option v-for="year in yearOptions" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </select>
                </div>

                <!-- Message for admins when no report exists -->
                <div v-if="authStore.isAdmin && !currentReport" class="border rounded-lg p-4 min-h-[200px] bg-gray-50 flex items-center justify-center">
                  <p class="text-sm text-gray-500 text-center">
                    Nur Benutzer können neue Berichte erstellen.
                  </p>
                </div>

                <!-- Editable textarea -->
                <div v-else class="border rounded-lg p-4 min-h-[200px] bg-white">
                  <textarea
                      v-model="currentReportContent"
                      rows="8"
                      :disabled="(authStore.isAdmin && !currentReport) || (!authStore.isAdmin && isCompleted)"
                      class="w-full text-sm text-gray-700 border-none resize-none focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                      :placeholder="authStore.isAdmin && !currentReport ? 'Kein Bericht vorhanden' : (!authStore.isAdmin && isCompleted) ? 'Beschluss ist abgeschlossen' : 'Bericht für das ausgewählte Jahr eingeben...'"
                  />
                </div>
                <div v-if="!authStore.isAdmin || currentReport" class="mt-4 flex items-center space-x-2">
                  <label class="text-sm font-medium text-gray-700">Voraussichtlich erledigt bis:</label>
                  <select
                      v-model="currentReportQuarter"
                      :disabled="(authStore.isAdmin && !currentReport) || (!authStore.isAdmin && isCompleted)"
                      class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">Nicht angegeben</option>
                    <option v-for="quarter in quarterOptions" :key="quarter" :value="quarter">
                      {{ quarter }}
                    </option>
                  </select>
                </div>
                <div class="mt-4 flex items-center space-x-2">
                  <!-- Completion Checkbox for Users -->
                  <label
                      v-if="!authStore.isAdmin && !isCompleted"
                      class="text-sm font-medium text-gray-700"
                  >
                    <input
                        type="checkbox"
                        :checked="decision.canBeCompleted || false"
                        @change="toggleCanBeCompleted"
                        class="h-4 w-4 text-success-600 focus:ring-success-500 border-gray-300 rounded"
                    />
                    <span class="ml-2 text-sm text-gray-700">Als erledigt markieren</span>
                  </label>
                </div>

                <div v-if="!authStore.isAdmin || currentReport" class="mt-4 flex justify-end space-x-2">
                  <button
                      @click="saveCurrentReport"
                      :disabled="(authStore.isAdmin && !currentReport) || (!authStore.isAdmin && isCompleted)"
                      :class="[
                        'px-4 py-2 text-sm rounded-lg transition-colors duration-200',
                        (authStore.isAdmin && !currentReport) || (!authStore.isAdmin && isCompleted)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      ]"
                  >
                    {{ !authStore.isAdmin ? 'Bericht zwischenspeichern' : 'Bericht speichern'}}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->

          <!-- Timeline -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Verlauf</h3>
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <div>
                  <p class="text-sm font-medium text-gray-900">Beschluss erfasst</p>
                  <p class="text-xs text-gray-500">{{ formatDate(decision.decisionDate) }}</p>
                </div>
              </div>
              <div v-if="lastReport" class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-2 h-2 bg-warning-600 rounded-full mt-2"></div>
                <div>
                  <p class="text-sm font-medium text-gray-900">In Bearbeitung</p>
                  <p class="text-xs text-gray-500">
                    {{ formatDate(lastReport.createdAt) }}
                    <span v-if="lastReport.createdByUser">
                    von {{ lastReport.createdByUser.firstName }} {{ lastReport.createdByUser.lastName }}
                  </span>
                  </p>
                </div>
              </div>
              <div v-if="decision.status === 'completed'" class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-2 h-2 bg-success-600 rounded-full mt-2"></div>
                <div>
                  <p class="text-sm font-medium text-gray-900">Abgeschlossen</p>
                  <p class="text-xs text-gray-500">
                    <span v-if="decision.completedAt">{{ formatDate(decision.completedAt) }}</span>
                    <span v-if="decision.completedByUser">
                    von {{ decision.completedByUser.firstName }} {{ decision.completedByUser.lastName }}
                  </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="p-6">
      <div class="text-center">
        <p class="text-gray-500">Beschluss nicht gefunden.</p>
        <router-link to="/decisions" class="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Zurück zur Übersicht
        </router-link>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDecisionStore } from '../stores/decisions'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import AppLayout from '../components/AppLayout.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { ArrowLeftIcon, PencilIcon, CheckIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

const route = useRoute()
const store = useDecisionStore()
const authStore = useAuthStore()
const toastStore = useToastStore()
const isLoading = ref(false)

const decision = computed(() =>
    store.decisions.find(d => d.id === route.params.id as string)
)

const hasAccess = computed(() => {
  if (!decision.value) return false
  if (authStore.isAdmin) return true
  if (!authStore.user?.department) return false
  return decision.value.responsibleDepartments.includes(authStore.user.department?.name)
})

onMounted(async () => {
  if (!decision.value) {
    isLoading.value = true
    await store.fetchDecisions({ page: 0, size: 100 }) // TODO
    isLoading.value = false
  }
})

const isCompleted = computed(() => decision.value?.status === 'completed')

const lastReport = computed(() => {
  if (!decision.value?.reports || decision.value.reports.length === 0) return null
  return decision.value.reports
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
})

const quarterOptions = computed(() => store.generateQuarterOptions())
const yearOptions = computed(() => store.generateYearOptions())
const selectedYear = ref(store.getCurrentYear())
const currentReportContent = ref('')
const currentReportQuarter = ref('')

const previousReports = computed(() => {
  if (!decision.value?.reports) return []
  return decision.value.reports
      .filter(report => report.year !== selectedYear.value)
      .sort((a, b) => {
        // Sort by year descending (newest first)
        const [startYearA] = a.year.split('/').map(Number)
        const [startYearB] = b.year.split('/').map(Number)
        return startYearB - startYearA
      })
})

const currentReport = computed(() => {
  if (!decision.value?.reports) return null
  return decision.value.reports.find(report => report.year === selectedYear.value)
})

// Watch for changes in selected year to load existing report
watch([selectedYear, currentReport], () => {
  if (currentReport.value) {
    currentReportContent.value = currentReport.value.content
    currentReportQuarter.value = currentReport.value.expectedCompletionQuarter || ''
  } else {
    currentReportContent.value = ''
    currentReportQuarter.value = ''
  }
}, { immediate: true })

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE')
}

async function setCompleted(completed: boolean) {
  if (!decision.value) return

  try {
    await store.setDecisionCompleted(decision.value.id, completed)
    toastStore.success(
        completed ? 'Beschluss wurde als abgeschlossen markiert' : 'Beschluss wurde wieder in Bearbeitung gesetzt',
        3000
    )
  } catch (err: any) {
    toastStore.error(`Fehler beim Aktualisieren des Status: ${err.message}`, 5000)
  }
}

async function toggleCanBeCompleted() {
  if (decision.value) {
    try {
      await store.toggleCanBeCompleted(decision.value.id, !decision.value.canBeCompleted)
    } catch (err) {
      console.error('Failed to toggle canBeCompleted:', err)
    }
  }
}

async function saveCurrentReport() {
  if (!decision.value) return

  if (!authStore.isAdmin && isCompleted.value) {
    toastStore.error('Berichte können nicht bearbeitet werden, wenn der Beschluss abgeschlossen ist.', 5000)
    return
  }

  const reportData = {
    year: selectedYear.value,
    content: currentReportContent.value,
    expectedCompletionQuarter: currentReportQuarter.value || undefined
  }

  try {
    if (currentReport.value) {
      await store.updateReport(decision.value.id, currentReport.value.id, reportData)
      toastStore.success('Bericht erfolgreich aktualisiert', 5000)
    } else {
      if (authStore.isAdmin) {
        toastStore.error('Nur Benutzer können neue Berichte erstellen.', 5000)
        return
      }
      await store.addReport(decision.value.id, reportData)
      toastStore.success('Bericht erfolgreich erstellt', 5000)
    }
  } catch (error: any) {
    toastStore.error(`Fehler beim Speichern: ${error.message}`, 5000)
  }
}
</script>