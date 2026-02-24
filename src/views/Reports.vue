<template>
  <AppLayout>
    <div class="p-6">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Berichte</h2>
        <p class="text-gray-600 mt-1">Berichte über nicht abgeschlossene Beschlüsse</p>
      </div>

      <!-- Report Header -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            Bericht zum Ende Jahr {{ reportsStore.selectedYear }} über die noch nicht abschließend erledigten Beschlüsse der Gremien
          </h3>
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Jahr:</label>
            <select
                v-model="reportsStore.selectedYear"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option v-for="year in yearOptions" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-warning-50 p-6 rounded-lg">
            <p class="text-sm text-warning-600">In Bearbeitung</p>
            <p class="text-2xl font-bold text-warning-900">{{ reportsStore.inProgressDecisions.length }}</p>
          </div>

          <div class="bg-error-50 p-6 rounded-lg">
            <p class="text-sm text-error-600">Fehlende Sachstand</p>
            <p class="text-2xl font-bold text-error-900">{{ reportsStore.decisionsWithoutReportForSelectedYear.length }}</p>
            <p class="text-xs text-error-600 mt-1">Beschlüsse ohne Bericht für {{ reportsStore.selectedYear }}</p>
          </div>

          <div class="bg-primary-50 p-6 rounded-lg">
            <p class="text-sm text-primary-600">Gesamt</p>
            <p class="text-2xl font-bold text-primary-900">{{ reportsStore.decisions.length }}</p>
          </div>
        </div>
      </div>

      <!-- Report Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="reportsStore.loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-gray-600">Lade Berichte...</p>
        </div>

        <div v-else>
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
                  zust. OE
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  vor. erledigt bis:
                </th>
              </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
              <tr
                  v-for="decision in reportsStore.reportDecisions"
                  :key="decision.id"
                  :class="[
                    isMissingReport(decision) ? 'bg-error-50 hover:bg-error-100' : 'hover:bg-gray-50'
                  ]"
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

          <div v-if="reportsStore.reportDecisions.length === 0" class="p-8 text-center text-gray-500">
            Alle Beschlüsse sind abgeschlossen.
          </div>

          <!-- Pagination -->
          <div v-if="reportsStore.totalPages > 1" class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                  @click="reportsStore.previousPage()"
                  :disabled="reportsStore.currentPage === 0"
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Zurück
              </button>
              <button
                  @click="reportsStore.nextPage()"
                  :disabled="reportsStore.currentPage >= reportsStore.totalPages - 1"
                  class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Zeige
                  <span class="font-medium">{{ reportsStore.currentPage * reportsStore.pageSize + 1 }}</span>
                  bis
                  <span class="font-medium">{{ Math.min((reportsStore.currentPage + 1) * reportsStore.pageSize, reportsStore.totalElements) }}</span>
                  von
                  <span class="font-medium">{{ reportsStore.totalElements }}</span>
                  Ergebnissen
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                      @click="reportsStore.previousPage()"
                      :disabled="reportsStore.currentPage === 0"
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Zurück</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button
                      v-for="page in visiblePages"
                      :key="page"
                      @click="reportsStore.goToPage(page)"
                      :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    page === reportsStore.currentPage
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  ]"
                  >
                    {{ page + 1 }}
                  </button>
                  <button
                      @click="reportsStore.nextPage()"
                      :disabled="reportsStore.currentPage >= reportsStore.totalPages - 1"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Weiter</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Actions -->
      <div class="mt-6 flex justify-end space-x-4">
        <button
            @click="exportReport"
            :disabled="reportsStore.loading"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
          Bericht exportieren
        </button>
        <button
            @click="printReport"
            :disabled="reportsStore.loading"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PrinterIcon class="h-4 w-4 mr-2" />
          Drucken
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useReportsStore } from '../stores/reports'
import AppLayout from '../components/AppLayout.vue'
import { DocumentArrowDownIcon, PrinterIcon } from '@heroicons/vue/24/outline'

const reportsStore = useReportsStore()
const yearOptions = computed(() => reportsStore.generateYearOptions().reverse())

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = reportsStore.totalPages
  const current = reportsStore.currentPage

  if (total <= 7) {
    for (let i = 0; i < total; i++) {
      pages.push(i)
    }
  } else {
    if (current < 3) {
      for (let i = 0; i < 5; i++) pages.push(i)
      pages.push(total - 1)
    } else if (current > total - 4) {
      pages.push(0)
      for (let i = total - 5; i < total; i++) pages.push(i)
    } else {
      pages.push(0)
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push(total - 1)
    }
  }

  return pages
})

onMounted(() => {
  reportsStore.fetchReportDecisions()
})

function isMissingReport(decision: any): boolean {
  if (!decision.reports || decision.reports.length === 0) {
    return true
  }
  const hasReportForYear = decision.reports.some((report: any) => report.year === reportsStore.selectedYear)
  return !hasReportForYear
}

function getSelectedYearReport(decision: any): string {
  if (!decision.reports || decision.reports.length === 0) {
    return 'Keine Angaben'
  }

  const selectedReport = decision.reports.find((report: any) => report.year === reportsStore.selectedYear)
  return selectedReport ? selectedReport.content : 'Keine Angaben'
}

function getSelectedYearExpectedCompletion(decision: any): string | null {
  if (!decision.reports || decision.reports.length === 0) {
    return null
  }

  const selectedReport = decision.reports.find((report: any) => report.year === reportsStore.selectedYear)
  return selectedReport?.expectedCompletionQuarter || null
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE')
}

function exportReport() {
  const csvContent = [
    ['Thema', 'Betreff', 'Beschlussdatum', 'Gremium', 'Drucksache', 'Fachbereich', 'Status', 'Sachstand', 'vor. erledigt bis'].join(';'),
    ...reportsStore.reportDecisions.map(decision => [
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