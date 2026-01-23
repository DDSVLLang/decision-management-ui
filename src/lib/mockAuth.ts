export interface User {
    id: string
    email: string
    role: 'admin' | 'user'
    first_name: string
    last_name: string
    responsibleDepartment?: string
}

export interface AuthResponse {
    user: User | null
    error: Error | null
}

const MOCK_USERS = [
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', email: 'admin@example.com', password: 'admin123', role: 'admin' as const, first_name: 'Admin', last_name: 'User', responsibleDepartment: undefined },
    { id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', email: 'user1@example.com', password: 'user123', role: 'user' as const, first_name: 'Normal', last_name: 'User', responsibleDepartment: 'FD 13' },
    { id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', email: 'user2@example.com', password: 'user234', role: 'user' as const, first_name: 'Normal', last_name: 'User', responsibleDepartment: 'FD 30' }
]

const STORAGE_KEY = 'mock_auth_user'

export const mockAuth = {
    async signIn(email: string, password: string): Promise<AuthResponse> {
        await new Promise(resolve => setTimeout(resolve, 500))

        const user = MOCK_USERS.find(u => u.email === email && u.password === password)

        if (!user) {
            return {
                user: null,
                error: new Error('Invalid email or password')
            }
        }

        const authUser = {
            id: user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            responsibleDepartment: user.responsibleDepartment
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))

        return {
            user: authUser,
            error: null
        }
    },

    async signOut(): Promise<{ error: Error | null }> {
        await new Promise(resolve => setTimeout(resolve, 200))
        localStorage.removeItem(STORAGE_KEY)
        return { error: null }
    },

    getSession(): { user: User | null } {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return { user: null }

        try {
            return { user: JSON.parse(stored) }
        } catch {
            return { user: null }
        }
    },

    onAuthStateChange(callback: (user: User | null) => void) {
        const handler = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                const user = e.newValue ? JSON.parse(e.newValue) : null
                callback(user)
            }
        }

        window.addEventListener('storage', handler)

        return {
            unsubscribe: () => window.removeEventListener('storage', handler)
        }
    }
}
