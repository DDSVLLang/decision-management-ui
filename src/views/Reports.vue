<template>
  <AppLayout>
    <div class="p-6">
      <div class="mb-8">
        <h3 class="text-2xl font-normal tracking-[0.08em] text-gray-600">Berichte</h3>
        <p class="mt-1 text-sm text-[#8a8578]">Berichte über nicht abgeschlossene Beschlüsse</p>
      </div>

      <!-- Report Header -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            Bericht zum Ende Jahr {{ selectedYear }} über die noch nicht abschließend erledigten Beschlüsse der Gremien
          </h3>
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Jahr:</label>
            <select
                v-model="selectedYear"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option v-for="year in yearOptions" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Gesamt offen</p>
            <p class="text-2xl font-bold text-gray-900">{{ pendingDecisions.length }}</p>
          </div>
          <div class="bg-warning-50 p-4 rounded-lg">
            <p class="text-sm text-warning-600">In Bearbeitung</p>
            <p class="text-2xl font-bold text-warning-900">{{ inProgressDecisions.length }}</p>
          </div>
          <div class="bg-error-50 p-4 rounded-lg">
            <p class="text-sm text-error-600">Überfällig</p>
            <p class="text-2xl font-bold text-error-900">{{ overdueDecisions.length }}</p>
          </div>
        </div>
      </div>

      <!-- Report Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thema<br>
                <span class="font-normal">Betreff</span><br>
                <span class="font-normal">Stand der Erledigung</span>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Beschlussdatum
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gremium
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Drucksache
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                zust. Organisationseinheit
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                vor. erledigt bis:
              </th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr
                v-for="decision in reportDecisions"
                :key="decision.id"
                class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 text-sm">
                <div class="space-y-2">
                  <div class="font-medium text-gray-900">{{ decision.topic }}</div>
                  <div class="text-gray-900">{{ decision.title }}</div>
                  <div class="text-gray-600">
                    <div class="mb-2">
                      <strong>Sachstand:</strong><br>
                      {{ getSelectedYearReport(decision) }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(decision.decisionDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ decision.decisionBody }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ decision.printMatter }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ decision.responsibleDepartment }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ getSelectedYearExpectedCompletion(decision) || '-' }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-if="reportDecisions.length === 0" class="p-8 text-center text-gray-500">
          Alle Beschlüsse sind abgeschlossen.
        </div>
      </div>

      <!-- Export Actions -->
      <div class="mt-6 flex justify-end space-x-4">
        <button
            @click="exportReport"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
        >
          <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
          Bericht exportieren
        </button>
        <button
            @click="printReport"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center"
        >
          <PrinterIcon class="h-4 w-4 mr-2" />
          Drucken
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDecisionStore } from '../stores/decisions'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/AppLayout.vue'
import { DocumentArrowDownIcon, PrinterIcon } from '@heroicons/vue/24/outline'

const store = useDecisionStore()
const authStore = useAuthStore()
const selectedYear = ref(store.getCurrentYear())
const yearOptions = computed(() => store.generateYearOptions().reverse()) // Show newest first

const filterByDepartment = (decisions: any[]) => {
  if (authStore.isAdmin || !authStore.user?.responsibleDepartment) {
    return decisions
  }
  return decisions.filter(d => d.responsibleDepartment === authStore.user!.responsibleDepartment)
}

const pendingDecisions = computed(() => filterByDepartment(store.pendingDecisions))
const inProgressDecisions = computed(() =>
    filterByDepartment(store.decisions.filter(d => d.status === 'in-progress'))
)

const overdueDecisions = computed(() =>
    filterByDepartment(store.decisions.filter(d => {
      if (!d.dueDate || d.status === 'completed') return false
      return new Date(d.dueDate) < new Date()
    }))
)

const reportDecisions = computed(() =>
    filterByDepartment(store.decisions.filter(d => d.status !== 'completed'))
        .sort((a, b) => new Date(a.decisionDate).getTime() - new Date(b.decisionDate).getTime())
)

function getSelectedYearReport(decision: any): string {
  if (!decision.reports || decision.reports.length === 0) {
    return 'Keine Angaben'
  }

  const selectedReport = decision.reports.find((report: any) => report.year === selectedYear.value)
  return selectedReport ? selectedReport.content : 'Keine Angaben'
}

function getSelectedYearExpectedCompletion(decision: any): string | null {
  if (!decision.reports || decision.reports.length === 0) {
    return null
  }

  const selectedReport = decision.reports.find((report: any) => report.year === selectedYear.value)
  return selectedReport?.expectedCompletionQuarter || null
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE')
}

function exportReport() {
  // Simple CSV export
  const csvContent = [
    ['Thema', 'Betreff', 'Beschlussdatum', 'Gremium', 'Drucksache', 'Organisationseinheit', 'Status', 'Sachstand', 'vor. erledigt bis'].join(';'),
    ...reportDecisions.value.map(decision => [
      decision.topic,
      decision.title,
      formatDate(decision.decisionDate),
      decision.decisionBody,
      decision.printMatter,
      decision.responsibleDepartment,
      decision.status === 'pending' ? 'Ausstehend' : 'In Bearbeitung',
      getSelectedYearReport(decision),
      getSelectedYearExpectedCompletion(decision) || '-'
    ].join(';'))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `beschluss-bericht-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function printReport() {
  window.print()
}
</script>