import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useManagementStore } from './management'
import { DecisionsApi, type Decision as ApiDecision, type Department, type DecisionSearchParams } from '../lib/decisionsApi'

export interface Decision {
  id: string
  title: string
  decisionBody: string
  decisionDate: string
  printMatter: string
  responsibleDepartment: string
  responsibleDepartments: string[]
  departments: Department[]
  topic: string
  status: string
  priority: string
  content: string
  dueDate?: string
  implementationNotes?: string
  reports: Report[]
  deleted: boolean
  createdBy?: string
  completedAt?: string
  completedBy?: string
  completedByUser?: { firstName: string; lastName: string }
}

export interface Report {
  id: string
  year: string
  content: string
  status: string
  expectedCompletionQuarter?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  createdByUser?: { firstName: string; lastName: string }
}

export { type Department } from '../lib/decisionsApi'

function mapApiDecisionToDecision(apiDecision: ApiDecision): Decision {
  return {
    id: apiDecision.id,
    title: apiDecision.title,
    decisionBody: apiDecision.decisionCommittee,
    decisionDate: apiDecision.decisionDate,
    printMatter: apiDecision.printMatter,
    responsibleDepartment: apiDecision.decisionDepartment,
    responsibleDepartments: apiDecision.departments.map(d => d.name),
    departments: apiDecision.departments,
    topic: apiDecision.decisionTopic,
    status: apiDecision.status,
    priority: apiDecision.priority,
    content: apiDecision.content,
    reports: apiDecision.reports,
    deleted: apiDecision.deleted,
    completedAt: apiDecision.completedAt
  }
}

export const useDecisionStore = defineStore('decisions', () => {
  const decisions = ref<Decision[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(0)
  const totalPages = ref(0)
  const totalElements = ref(0)
  const pageSize = ref(20)

  async function fetchDecisions(params: DecisionSearchParams = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await DecisionsApi.searchDecisions(params)

      if (!response.data || !response.data.content) {
        decisions.value = []
        currentPage.value = 0
        totalPages.value = 0
        totalElements.value = 0
        pageSize.value = params.size ?? 20
        return
      }

      decisions.value = response.data.content.map(mapApiDecisionToDecision)
      currentPage.value = response.data.number
      totalPages.value = response.data.totalPages
      totalElements.value = response.data.totalElements
      pageSize.value = response.data.size
    } catch (err: any) {
      error.value = err.message || 'Fehler beim Laden der Beschlüsse'
      console.error('Error fetching decisions:', err)
    } finally {
      loading.value = false
    }
  }

  const managementStore = useManagementStore()

  const committees = computed(() => managementStore.committees.map(c => c.name))
  const departments = computed(() => managementStore.departments.map(d => d.name))
  const topics = computed(() => managementStore.topics.map(t => t.name))

  async function loadManagementData() {
    await Promise.all([
      managementStore.loadCommittees(),
      managementStore.loadDepartments(),
      managementStore.loadTopics()
    ])
  }

  const pendingDecisions = computed(() =>
      decisions.value.filter(d => d.status === 'pending' || d.status === 'in-progress')
  )

  const completedDecisions = computed(() =>
      decisions.value.filter(d => d.status === 'completed')
  )

  function calculateStatus(decision: Decision, ignoreCompleted = false): string {
    if (!ignoreCompleted && decision.status === 'completed') {
      return 'completed'
    }
    if (decision.reports && decision.reports.length > 0) {
      return 'in-progress'
    }
    return 'pending'
  }

  function addDecision(decision: Omit<Decision, 'id' | 'reports' | 'status'>) {
    const newDecision = {
      ...decision,
      id: Date.now().toString(),
      reports: [],
      status: 'pending',
      deleted: false
    }
    decisions.value.push(newDecision)
    return newDecision
  }

  function updateDecision(id: string, updates: Partial<Omit<Decision, 'status'>>) {
    const index = decisions.value.findIndex(d => d.id === id)
    if (index !== -1) {
      decisions.value[index] = { ...decisions.value[index], ...updates }
      return decisions.value[index]
    }
    return null
  }

  function setDecisionCompleted(id: string, completed: boolean) {
    const authStore = useAuthStore()
    const index = decisions.value.findIndex(d => d.id === id)
    if (index !== -1) {
      if (completed) {
        decisions.value[index].status = 'completed'
        decisions.value[index].completedAt = new Date().toISOString()
        decisions.value[index].completedBy = authStore.user?.id
        decisions.value[index].completedByUser = authStore.user ? {
          firstName: authStore.user.firstName,
          lastName: authStore.user.lastName
        } : undefined
      } else {
        decisions.value[index].status = calculateStatus(decisions.value[index], true)
        decisions.value[index].completedAt = undefined
        decisions.value[index].completedBy = undefined
        decisions.value[index].completedByUser = undefined
      }
      return decisions.value[index]
    }
    return null
  }

  async function deleteDecision(id: string) {
    try {
      await DecisionsApi.deleteDecision(id)
      const index = decisions.value.findIndex(d => d.id === id)
      if (index !== -1) {
        decisions.value[index].deleted = true
      }
    } catch (err: any) {
      error.value = err.message || 'Fehler beim Löschen des Beschlusses'
      console.error('Error deleting decision:', err)
      throw err
    }
  }

  function addReport(decisionId: string, report: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'createdBy' | 'createdByUser'>) {
    const authStore = useAuthStore()
    const decision = decisions.value.find(d => d.id === decisionId)
    if (decision) {
      if (!decision.reports) {
        decision.reports = []
      }
      const now = new Date().toISOString()
      const newReport: Report = {
        ...report,
        id: Date.now().toString(),
        status: 'DRAFT',
        createdAt: now,
        updatedAt: now,
        createdBy: authStore.user?.id,
        createdByUser: authStore.user ? {
          firstName: authStore.user.firstName,
          lastName: authStore.user.lastName
        } : undefined
      }
      decision.reports.push(newReport)
      decision.status = calculateStatus(decision)
    }
  }

  function updateReport(decisionId: string, reportId: string, updates: Partial<Report>) {
    const decision = decisions.value.find(d => d.id === decisionId)
    if (decision && decision.reports) {
      const reportIndex = decision.reports.findIndex(r => r.id === reportId)
      if (reportIndex !== -1) {
        decision.reports[reportIndex] = {
          ...decision.reports[reportIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }
    }
  }

  function getCurrentYear(): string {
    const now = new Date()
    const currentYear = now.getFullYear()
    const month = now.getMonth() + 1
    // If we're in the first half of the year, we're still in the previous reporting year
    if (month <= 6) {
      return `${currentYear - 1}/${currentYear}`
    } else {
      return `${currentYear}/${currentYear + 1}`
    }
  }

  function generateYearOptions(): string[] {
    const options: string[] = []
    for (let year = 2010; year <= 2025; year++) {
      options.push(`${year}/${year + 1}`)
    }
    return options
  }

  function generateQuarterOptions(): string[] {
    const options: string[] = []
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const currentQuarter = Math.ceil(currentMonth / 3)

    for (let year = currentYear; year <= currentYear + 5; year++) {
      const startQuarter = year === currentYear ? currentQuarter : 1
      for (let quarter = startQuarter; quarter <= 4; quarter++) {
        options.push(`${year}/Q${quarter}`)
      }
    }
    return options
  }
  return {
    decisions,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    committees,
    departments,
    topics,
    pendingDecisions,
    completedDecisions,
    loadManagementData,
    fetchDecisions,
    addDecision,
    updateDecision,
    setDecisionCompleted,
    deleteDecision,
    addReport,
    updateReport,
    getCurrentYear,
    generateYearOptions,
    generateQuarterOptions
  }
})