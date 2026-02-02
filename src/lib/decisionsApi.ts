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

export class DecisionsApi {
    static async searchDecisions(page: number = 0, size: number = 20): Promise<DecisionSearchResponse> {
        try {
            const response = await api.get<DecisionSearchResponse>(
                `/api/v1/decision/search?size=${size}&page=${page}`
            )
            return response
        } catch (error: any) {
            console.error('Error searching decisions:', error)
            throw error
        }
    }
}
