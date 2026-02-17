import { api } from './api'

export interface Department {
    id: string
    name: string
    shortName: string
    description?: string
    active?: boolean
}

export interface UserDto {
    id: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    role: 'admin' | 'user'
    active: boolean
    department?: Department | null
    responsibleDepartment?: string | null
    createdAt: string
    updatedAt: string
}

export interface UsersResponse {
    success: boolean
    data: UserDto[]
    timestamp: string
}

export interface CreateUserDto {
    email: string
    password: string
    firstName: string
    lastName: string
    role: 'USER' | 'ADMIN'
    departmentId?: string
}

export interface UpdateUserDto {
    email: string
    password?: string
    firstName: string
    lastName: string
    role: 'USER' | 'ADMIN'
    departmentId?: string
}

export interface CreateUserResponse {
    success: boolean
    message: string
    data: {
        token: string
        tokenType: string
        expiresIn: number
        user: UserDto
    }
    timestamp: string
}

export interface UpdateUserResponse {
    success: boolean
    message: string
    data: UserDto
    timestamp: string
}

export interface ValidationError {
    timestamp: string
    status: number
    error: string
    message: string
    path: string
    validationErrors?: Record<string, string>
}

export class UsersApi {
    static async getUsers(): Promise<UserDto[]> {
        try {
            const response = await api.get<UsersResponse>('/api/v1/management/user')
            return response.data || []
        } catch (error: any) {
            if (error.status === 204) {
                return []
            }
            console.error('Error fetching users:', error)
            throw error
        }
    }

    static async createUser(data: CreateUserDto): Promise<UserDto> {
        try {
            const response = await api.post<CreateUserResponse>('/api/v1/auth/register', data)
            return response.data.user
        } catch (error: any) {
            console.error('Error creating user:', error)

            if (error.message && error.message.includes('{')) {
                try {
                    const errorData = JSON.parse(error.message.substring(error.message.indexOf('{')))
                    if (errorData.validationErrors) {
                        const validationMessages = Object.values(errorData.validationErrors).join(', ')
                        throw new Error(validationMessages)
                    }
                    if (errorData.message) {
                        throw new Error(errorData.message)
                    }
                } catch (parseError) {
                    if (parseError instanceof Error && parseError.message !== error.message) {
                        throw parseError
                    }
                }
            }

            throw error
        }
    }

    static async updateUser(id: string, data: UpdateUserDto): Promise<UserDto> {
        try {
            const response = await api.put<UpdateUserResponse>(`/api/v1/management/user/${id}`, data)
            return response.data
        } catch (error: any) {
            console.error('Error updating user:', error)

            if (error.message && error.message.includes('{')) {
                try {
                    const errorData = JSON.parse(error.message.substring(error.message.indexOf('{')))
                    if (errorData.validationErrors) {
                        const validationMessages = Object.values(errorData.validationErrors).join(', ')
                        throw new Error(validationMessages)
                    }
                    if (errorData.message) {
                        throw new Error(errorData.message)
                    }
                } catch (parseError) {
                    if (parseError instanceof Error && parseError.message !== error.message) {
                        throw parseError
                    }
                }
            }

            throw error
        }
    }

    static async deleteUser(id: string): Promise<void> {
        try {
            await api.delete(`/api/v1/management/user/${id}`)
        } catch (error: any) {
            console.error('Error deleting user:', error)

            if (error.message && error.message.includes('{')) {
                try {
                    const errorData = JSON.parse(error.message.substring(error.message.indexOf('{')))
                    if (errorData.message) {
                        throw new Error(errorData.message)
                    }
                } catch (parseError) {
                    if (parseError instanceof Error && parseError.message !== error.message) {
                        throw parseError
                    }
                }
            }

            throw error
        }
    }
}
