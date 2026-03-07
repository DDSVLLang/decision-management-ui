import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { DecisionsApi, type Decision as ApiDecision, type DecisionSearchParams } from '../lib/decisionsApi'
import type { Department } from '../lib/decisionsApi'

export interface ReportDecision {
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
    reports: Report[]
    deleted: boolean
    completedAt?: string
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

function mapApiDecisionToReportDecision(apiDecision: ApiDecision): ReportDecision {
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

export const useReportsStore = defineStore('reports', () => {
    const decisions = ref<ReportDecision[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const currentPage = ref(0)
    const totalPages = ref(0)
    const totalElements = ref(0)
    const pageSize = ref(20)
    const selectedYear = ref(getCurrentYear())

    const authStore = useAuthStore()

    async function fetchReportDecisions(page: number = 0, size: number = 2000) {
        loading.value = true
        error.value = null
        try {
            const params: DecisionSearchParams = {
                page,
                size
            }

            if (!authStore.isAdmin && authStore.user?.responsibleDepartment) {
                params.department = authStore.user.responsibleDepartment
            }

            params.status = 'in-progress'

            const response = await DecisionsApi.searchDecisions(params)

            if (!response.data || !response.data.content) {
                decisions.value = []
                currentPage.value = 0
                totalPages.value = 0
                totalElements.value = 0
                pageSize.value = size
                return
            }

            decisions.value = response.data.content.map(mapApiDecisionToReportDecision)
            currentPage.value = response.data.number
            totalPages.value = response.data.totalPages
            totalElements.value = response.data.totalElements
            pageSize.value = response.data.size
        } catch (err: any) {
            error.value = err.message || 'Fehler beim Laden der Berichte'
            console.error('Error fetching report decisions:', err)
        } finally {
            loading.value = false
        }
    }

    const pendingDecisions = computed(() =>
        decisions.value.filter(d => d.status === 'pending')
    )

    const inProgressDecisions = computed(() =>
        decisions.value.filter(d => d.status === 'in-progress')
    )

    const overdueDecisions = computed(() =>
        decisions.value.filter(d => {
            if (!d.dueDate || d.status === 'completed') return false
            return new Date(d.dueDate) < new Date()
        })
    )

    const reportDecisions = computed(() =>
        decisions.value
            .filter(d => d.status !== 'completed')
    )

    const decisionsWithoutReportForSelectedYear = computed(() =>
        decisions.value.filter(d => {
            if (d.status === 'completed') return false
            if (!d.reports || d.reports.length === 0) return true
            const hasReportForYear = d.reports.some(r => r.year === selectedYear.value)
            return !hasReportForYear
        })
    )

    function getCurrentYear(): string {
        const now = new Date()
        const currentYear = now.getFullYear()
        const month = now.getMonth() + 1
        if (month <= 6) {
            return `${currentYear - 1}/${currentYear}`
        } else {
            return `${currentYear}/${currentYear + 1}`
        }
    }

    function generateYearOptions(): string[] {
        const now = new Date()
        const options: string[] = []
        for (let year = 2000; year <= now.getFullYear(); year++) {
            options.push(`${year}/${year + 1}`)
        }
        return options
    }

    function goToPage(page: number) {
        if (page >= 0 && page < totalPages.value) {
            fetchReportDecisions(page, pageSize.value)
        }
    }

    function nextPage() {
        if (currentPage.value < totalPages.value - 1) {
            goToPage(currentPage.value + 1)
        }
    }

    function previousPage() {
        if (currentPage.value > 0) {
            goToPage(currentPage.value - 1)
        }
    }

    return {
        decisions,
        loading,
        error,
        currentPage,
        totalPages,
        totalElements,
        pageSize,
        selectedYear,
        pendingDecisions,
        inProgressDecisions,
        overdueDecisions,
        reportDecisions,
        decisionsWithoutReportForSelectedYear,
        fetchReportDecisions,
        getCurrentYear,
        generateYearOptions,
        goToPage,
        nextPage,
        previousPage
    }
})