import { api } from './api'

export interface Department {
    id: string
    name: string
    shortName: string
    description: string | null
    active: boolean
    headUser: any | null
}

export interface Report {
    id: string
    year: string
    content: string
    status: string
    expectedCompletionQuarter?: string
    createdAt: string
    updatedAt: string
}

export interface Decision {
    id: string
    title: string
    decisionDate: string
    decisionCommittee: string
    printMatter: string
    decisionDepartment: string
    departments: Department[]
    decisionTopic: string
    status: string
    priority: string
    content: string
    reports: Report[]
    deleted: boolean
    completedAt?: string
}

export interface PageableInfo {
    pageNumber: number
    pageSize: number
    sort: {
        empty: boolean
        sorted: boolean
        unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
}

export interface DecisionSearchResponse {
    success: boolean
    data: {
        content: Decision[]
        pageable: PageableInfo
        last: boolean
        totalElements: number
        totalPages: number
        first: boolean
        size: number
        number: number
        sort: {
            empty: boolean
            sorted: boolean
            unsorted: boolean
        }
        numberOfElements: number
        empty: boolean
    }
    timestamp: string
}

export interface DecisionSearchParams {
    page?: number
    size?: number
    status?: string
    committee?: string
    department?: string
    topic?: string
    keyword?: string
}

export class DecisionsApi {
    static async searchDecisions(params: DecisionSearchParams = {}): Promise<DecisionSearchResponse> {
        try {
            const queryParams = new URLSearchParams()

            queryParams.append('page', (params.page ?? 0).toString())
            queryParams.append('size', (params.size ?? 20).toString())

            if (params.status) {
                queryParams.append('status', params.status)
            }
            if (params.committee) {
                queryParams.append('committee', params.committee)
            }
            if (params.department) {
                queryParams.append('department', params.department)
            }
            if (params.topic) {
                queryParams.append('topic', params.topic)
            }
            if (params.keyword) {
                queryParams.append('keyword', params.keyword)
            }

            const response = await api.get<DecisionSearchResponse>(
                `/api/v1/decision/search?${queryParams.toString()}`
            )
            return response
        } catch (error: any) {
            console.error('Error searching decisions:', error)
            throw error
        }
    }
}
