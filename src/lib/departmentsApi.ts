import { api } from './api'

export interface DepartmentDto {
    id: string
    name: string
    shortName: string
    description?: string
    createdAt: string
    updatedAt: string
}

export interface CreateDepartmentDto {
    name: string
    shortName: string
    description?: string
}

export interface UpdateDepartmentDto {
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

export class DepartmentsApi {
    private static readonly BASE_PATH = '/api/v1/management/department'

    static async getAll(): Promise<DepartmentDto[]> {
        try {
            const response = await api.get<ApiResponse<DepartmentDto[]>>(this.BASE_PATH)
            return response.data || []
        } catch (error) {
            console.error('Error fetching departments:', error)
            throw this.handleError(error)
        }
    }

    static async getById(id: string): Promise<DepartmentDto> {
        try {
            const response = await api.get<ApiResponse<DepartmentDto>>(`${this.BASE_PATH}/${id}`)
            if (!response.data) {
                throw new Error('Department not found')
            }
            return response.data
        } catch (error) {
            console.error(`Error fetching department ${id}:`, error)
            throw this.handleError(error)
        }
    }

    static async create(data: {
        name: string;
        shortName: string | undefined;
        description: string | undefined
    }): Promise<DepartmentDto> {
        try {
            const response = await api.post<ApiResponse<DepartmentDto>>(this.BASE_PATH, data)
            if (!response.data) {
                throw new Error('Failed to create department')
            }
            return response.data
        } catch (error) {
            console.error('Error creating department:', error)
            throw this.handleError(error)
        }
    }

    static async update(id: string, data: {
        name: string;
        shortName: string | undefined;
        description: string | undefined
    }): Promise<DepartmentDto> {
        try {
            const response = await api.put<ApiResponse<DepartmentDto>>(`${this.BASE_PATH}/${id}`, data)
            if (!response.data) {
                throw new Error('Failed to update department')
            }
            return response.data
        } catch (error) {
            console.error(`Error updating department ${id}:`, error)
            throw this.handleError(error)
        }
    }

    static async delete(id: string): Promise<void> {
        try {
            await api.delete(`${this.BASE_PATH}/${id}`)
        } catch (error) {
            console.error(`Error deleting department ${id}:`, error)
            throw this.handleError(error)
        }
    }

    private static handleError(error: any): Error {
        if (error instanceof Error) {
            if (error.message.includes('403')) {
                return new Error('Sie haben keine Berechtigung, auf diese Ressource zuzugreifen')
            }
            if (error.message.includes('404')) {
                return new Error('Fachdienst nicht gefunden')
            }
            if (error.message.includes('401')) {
                return new Error('Authentifizierung fehlgeschlagen')
            }
            return error
        }
        return new Error('Ein unbekannter Fehler ist aufgetreten')
    }
}
