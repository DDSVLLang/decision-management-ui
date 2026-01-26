const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export interface LoginCredentials {
    email: string
    password: string
}

export interface UserDto {
    id: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    role: string
    department: string | null
    responsibleDepartment: string | null
}

export interface LoginResponse {
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

export class AuthApi {
    private static readonly TOKEN_KEY = 'auth_token'
    private static readonly USER_KEY = 'auth_user'

    static async login(credentials: LoginCredentials): Promise<LoginResponse['data']> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            })

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Ungültige E-Mail oder Passwort')
                }
                throw new Error('Login fehlgeschlagen')
            }

            const result: LoginResponse = await response.json()

            if (!result.success || !result.data) {
                throw new Error('Login fehlgeschlagen')
            }

            this.setToken(result.data.token)
            this.setUser(result.data.user)

            return result.data
        } catch (error) {
            console.error('Login error:', error)
            if (error instanceof Error) {
                throw error
            }
            throw new Error('Ein unbekannter Fehler ist aufgetreten')
        }
    }

    static setToken(token: string): void {
        sessionStorage.setItem(this.TOKEN_KEY, token)
    }

    static getToken(): string | null {
        return sessionStorage.getItem(this.TOKEN_KEY)
    }

    static setUser(user: UserDto): void {
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(user))
    }

    static getUser(): UserDto | null {
        const userJson = sessionStorage.getItem(this.USER_KEY)
        if (!userJson) return null
        try {
            return JSON.parse(userJson)
        } catch {
            return null
        }
    }

    static clearSession(): void {
        sessionStorage.removeItem(this.TOKEN_KEY)
        sessionStorage.removeItem(this.USER_KEY)
    }

    static hasValidSession(): boolean {
        return !!this.getToken() && !!this.getUser()
    }
}
