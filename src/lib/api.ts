import { AuthApi } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

interface ApiRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    body?: any
    headers?: Record<string, string>
}

async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options

    const token = AuthApi.getToken()

    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...headers,
        },
    }

    if (body) {
        config.body = JSON.stringify(body)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`
        try {
            const errorData = await response.json()
            if (errorData.validationErrors) {
                errorMessage = JSON.stringify(errorData)
            } else if (errorData.message) {
                errorMessage = errorData.message
            }
        } catch {
        }
        throw new Error(errorMessage)
    }

    if (response.status === 204) {
        return {} as T
    }

    return response.json()
}

export const api = {
    get: <T>(endpoint: string, headers?: Record<string, string>) =>
        apiRequest<T>(endpoint, { method: 'GET', headers }),

    post: <T>(endpoint: string, body: any, headers?: Record<string, string>) =>
        apiRequest<T>(endpoint, { method: 'POST', body, headers }),

    put: <T>(endpoint: string, body: any, headers?: Record<string, string>) =>
        apiRequest<T>(endpoint, { method: 'PUT', body, headers }),

    patch: <T>(endpoint: string, body: any, headers?: Record<string, string>) =>
        apiRequest<T>(endpoint, { method: 'PATCH', body, headers }),

    delete: <T>(endpoint: string, headers?: Record<string, string>) =>
        apiRequest<T>(endpoint, { method: 'DELETE', headers }),
}
