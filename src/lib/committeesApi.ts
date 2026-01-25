import { api } from './api'

export interface CommitteeDto {
    id: string
    name: string
    shortName: string
    description?: string
    createdAt: string
    updatedAt: string
}

export interface CreateCommitteeDto {
    name: string
    shortName: string
    description?: string
}

export interface UpdateCommitteeDto {
    name: string
    shortName: string
    description?: string
}

interface ApiResponse<T> {
    success: boolean
    data?: T
    message?: string
    timestamp: string
}

export class CommitteesApi {
    private static readonly BASE_PATH = '/api/v1/management/committee'

    static async getAll(): Promise<CommitteeDto[]> {
        try {
            const response = await api.get<ApiResponse<CommitteeDto[]>>(this.BASE_PATH)
            return response.data || []
        } catch (error) {
            console.error('Error fetching committees:', error)
            throw this.handleError(error)
        }
    }

    static async getById(id: string): Promise<CommitteeDto> {
        try {
            const response = await api.get<ApiResponse<CommitteeDto>>(`${this.BASE_PATH}/${id}`)
            if (!response.data) {
                throw new Error('Committee not found')
            }
            return response.data
        } catch (error) {
            console.error(`Error fetching committee ${id}:`, error)
            throw this.handleError(error)
        }
    }

    static async create(data: CreateCommitteeDto): Promise<CommitteeDto> {
        try {
            const response = await api.post<ApiResponse<CommitteeDto>>(this.BASE_PATH, data)
            if (!response.data) {
                throw new Error('Failed to create committee')
            }
            return response.data
        } catch (error) {
            console.error('Error creating committee:', error)
            throw this.handleError(error)
        }
    }

    static async update(id: string, data: UpdateCommitteeDto): Promise<CommitteeDto> {
        try {
            const response = await api.put<ApiResponse<CommitteeDto>>(`${this.BASE_PATH}/${id}`, data)
            if (!response.data) {
                throw new Error('Failed to update committee')
            }
            return response.data
        } catch (error) {
            console.error(`Error updating committee ${id}:`, error)
            throw this.handleError(error)
        }
    }

    static async delete(id: string): Promise<void> {
        try {
            await api.delete(`${this.BASE_PATH}/${id}`)
        } catch (error) {
            console.error(`Error deleting committee ${id}:`, error)
            throw this.handleError(error)
        }
    }

    private static handleError(error: any): Error {
        if (error instanceof Error) {
            if (error.message.includes('403')) {
                return new Error('Sie haben keine Berechtigung, auf diese Ressource zuzugreifen')
            }
            if (error.message.includes('404')) {
                return new Error('Thema nicht gefunden')
            }
            if (error.message.includes('401')) {
                return new Error('Authentifizierung fehlgeschlagen')
            }
            return error
        }
        return new Error('Ein unbekannter Fehler ist aufgetreten')
    }
}
