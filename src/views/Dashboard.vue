<template>
  <div class="p-6">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
      <p class="text-gray-600 mt-1">Überblick über alle Beschlüsse</p>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon class="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Gesamt</p>
            <p class="text-2xl font-bold text-gray-900">{{ decisions.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
              <ClockIcon class="h-5 w-5 text-warning-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Ausstehend</p>
            <p class="text-2xl font-bold text-gray-900">{{ pendingDecisions.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <PlayIcon class="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">In Bearbeitung</p>
            <p class="text-2xl font-bold text-gray-900">{{ inProgressDecisions.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon class="h-5 w-5 text-success-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Abgeschlossen</p>
            <p class="text-2xl font-bold text-gray-900">{{ completedDecisions.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Decisions -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">Aktuelle Beschlüsse</h3>
        <router-link
          to="/decisions"
          class="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          Alle anzeigen
        </router-link>
      </div>
      
      <div class="divide-y divide-gray-200">
        <div
          v-for="decision in recentDecisions"
          :key="decision.id"
          class="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
          @click="$router.push(`/decisions/${decision.id}`)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <p class="text-sm font-medium text-gray-900">
                  ID: {{ decision.id }}
                </p>
                <StatusBadge :status="decision.status" />
              </div>
              <p class="text-sm text-gray-600 mt-1">{{ decision.title }}</p>
              <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>{{ decision.decisionBody }}</span>
                <span>{{ formatDate(decision.decisionDate) }}</span>
                <span>{{ decision.responsibleDepartment }}</span>
              </div>
            </div>
            <ChevronRightIcon class="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDecisionStore } from '../stores/decisions'
import StatusBadge from '../components/StatusBadge.vue'
import { 
  DocumentTextIcon, 
  ClockIcon, 
  PlayIcon, 
  CheckCircleIcon,
  ChevronRightIcon 
} from '@heroicons/vue/24/outline'

const store = useDecisionStore()

const decisions = computed(() => store.decisions)
const pendingDecisions = computed(() => store.pendingDecisions)
const completedDecisions = computed(() => store.completedDecisions)

const inProgressDecisions = computed(() => 
  decisions.value.filter(d => d.status === 'in-progress')
)

const recentDecisions = computed(() => 
  decisions.value.slice().sort((a, b) => 
    new Date(b.decisionDate).getTime() - new Date(a.decisionDate).getTime()
  ).slice(0, 5)
)

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE')
}
</script>