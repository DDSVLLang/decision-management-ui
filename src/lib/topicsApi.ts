import { api } from './api'

export interface TopicDto {
    id: string
    name: string
    description?: string
    createdAt: string
    updatedAt: string
}

export interface CreateTopicDto {
    name: string
    description?: string
}

export interface UpdateTopicDto {
    name: string
    description?: string
}

interface ApiResponse<T> {
    success: boolean
    data?: T
    message?: string
    timestamp: string
}

export class TopicsApi {
    private static readonly BASE_PATH = '/api/v1/management/topic'

    static async getAll(): Promise<TopicDto[]> {
        try {
            const response = await api.get<ApiResponse<TopicDto[]>>(this.BASE_PATH)
            return response.data || []
        } catch (error) {
            console.error('Error fetching topics:', error)
            throw this.handleError(error)
        }
    }

    static async getById(id: string): Promise<TopicDto> {
        try {
            const response = await api.get<ApiResponse<TopicDto>>(`${this.BASE_PATH}/${id}`)
            if (!response.data) {
                throw new Error('Topic not found')
            }
            return response.data
        } catch (error) {
            console.error(`Error fetching topic ${id}:`, error)
            throw this.handleError(error)
        }
    }

    static async create(data: CreateTopicDto): Promise<TopicDto> {
        try {
            const response = await api.post<ApiResponse<TopicDto>>(this.BASE_PATH, data)
            if (!response.data) {
                throw new Error('Failed to create topic')
            }
            return response.data
        } catch (error) {
            console.error('Error creating topic:', error)
            throw this.handleError(error)
        }
    }

    static async update(id: string, data: UpdateTopicDto): Promise<TopicDto> {
        try {
            const response = await api.put<ApiResponse<TopicDto>>(`${this.BASE_PATH}/${id}`, data)
            if (!response.data) {
                throw new Error('Failed to update topic')
            }
            return response.data
        } catch (error) {
            console.error(`Error updating topic ${id}:`, error)
            throw this.handleError(error)
        }
    }

    static async delete(id: string): Promise<void> {
        try {
            await api.delete(`${this.BASE_PATH}/${id}`)
        } catch (error) {
            console.error(`Error deleting topic ${id}:`, error)
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
