import { api } from './api'

export interface CreateReportRequest {
    title: string
    year: string
    content: string
    expectedCompletionQuarter?: string
}

export interface UpdateReportRequest {
    title?: string
    year?: string
    content?: string
    expectedCompletionQuarter?: string
}

export interface ReportUser {
    firstName: string
    lastName: string
    email: string
}

export interface ReportResponse {
    id: string
    decisionId: string
    year: string
    content: string
    expectedCompletionQuarter?: string
    status: string
    createdAt: string
    updatedAt: string
    createdByUser: ReportUser
}

export interface CreateReportResponse {
    success: boolean
    message: string
    data: ReportResponse
    timestamp: string
}

export interface UpdateReportResponse {
    success: boolean
    message: string
    data: ReportResponse
    timestamp: string
}

export class ReportsApi {
    static async createReport(decisionId: string, data: CreateReportRequest): Promise<CreateReportResponse> {
        try {
            const response = await api.post<CreateReportResponse>(
                `/api/v1/decision/${decisionId}/report`,
                data
            )
            return response
        } catch (error: any) {
            console.error('Error creating report:', error)
            throw error
        }
    }

    static async updateReport(
        decisionId: string,
        reportId: string,
        data: UpdateReportRequest
    ): Promise<UpdateReportResponse> {
        try {
            const response = await api.put<UpdateReportResponse>(
                `/api/v1/decision/${decisionId}/report/${reportId}`,
                data
            )
            return response
        } catch (error: any) {
            console.error('Error updating report:', error)
            throw error
        }
    }
}