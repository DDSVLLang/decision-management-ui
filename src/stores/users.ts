import { defineStore } from 'pinia'
import { ref } from 'vue'
import { UsersApi, type UserDto, type Department } from '../lib/usersApi'

export interface AppUser {
    id: string
    firstName: string
    lastName: string
    fullName: string
    email: string
    role: 'admin' | 'user'
    active: boolean
    department?: Department | null
    responsibleDepartment?: string | null
    createdAt: string
    updatedAt: string
}

function mapUserDtoToAppUser(dto: UserDto): AppUser {
    return {
        id: dto.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
        fullName: dto.fullName,
        email: dto.email,
        role: dto.role,
        active: dto.active,
        department: dto.department,
        responsibleDepartment: dto.responsibleDepartment,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt
    }
}

export const useUsersStore = defineStore('users', () => {
    const users = ref<AppUser[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchUsers() {
        loading.value = true
        error.value = null
        try {
            const data = await UsersApi.getUsers()
            users.value = data.map(mapUserDtoToAppUser)
        } catch (err) {
            console.error('Error fetching users:', err)
            error.value = 'Fehler beim Laden der Benutzer'
            users.value = []
        } finally {
            loading.value = false
        }
    }

    function getUserByEmail(email: string) {
        return users.value.find(u => u.email === email)
    }

    function getUserById(id: string) {
        return users.value.find(u => u.id === id)
    }

    return {
        users,
        loading,
        error,
        fetchUsers,
        getUserByEmail,
        getUserById
    }
})