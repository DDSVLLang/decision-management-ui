import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthApi, type UserDto } from '../lib/authApi'
import {Department} from "../lib/decisionsApi.ts";

export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    role: string
    department?: Department | null
    responsibleDepartment?: string | null
}

function mapUserDtoToUser(dto: UserDto): User {
    return {
        id: dto.id,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        fullName: dto.fullName,
        role: dto.role,
        department: dto.department,
        responsibleDepartment: dto.responsibleDepartment
    }
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const loading = ref(true)

    const isAuthenticated = computed(() => !!user.value)
    const isAdmin = computed(() => user.value?.role === 'admin')
    const isUser = computed(() => user.value?.role === 'user')

    async function initialize() {
        loading.value = true
        try {
            if (AuthApi.hasValidSession()) {
                const userDto = AuthApi.getUser()
                if (userDto) {
                    user.value = mapUserDtoToUser(userDto)
                }
            }
        } catch (error) {
            console.error('Error initializing auth:', error)
            AuthApi.clearSession()
            user.value = null
        } finally {
            loading.value = false
        }
    }

    async function signIn(email: string, password: string) {
        try {
            const response = await AuthApi.login({ email, password })
            const authUser = mapUserDtoToUser(response.user)
            user.value = authUser
            return { user: authUser }
        } catch (error) {
            console.error('Sign in error:', error)
            throw error
        }
    }


    async function signOut() {
        try {
            AuthApi.clearSession()
            user.value = null
        } catch (error) {
            console.error('Sign out error:', error)
            throw error
        }
    }

    return {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isUser,
        initialize,
        signIn,
        signOut,
    }
})
