import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockAuth, type User } from '../lib/mockAuth'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const loading = ref(true)

    const isAuthenticated = computed(() => !!user.value)
    const isAdmin = computed(() => user.value?.role === 'admin')
    const isUser = computed(() => user.value?.role === 'user')

    async function initialize() {
        loading.value = true
        try {
            const { user: currentUser } = mockAuth.getSession()
            user.value = currentUser

            mockAuth.onAuthStateChange((newUser) => {
                user.value = newUser
            })
        } catch (error) {
            console.error('Error initializing auth:', error)
        } finally {
            loading.value = false
        }
    }

    async function signIn(email: string, password: string) {
        const { user: authUser, error } = await mockAuth.signIn(email, password)

        if (error) throw error
        user.value = authUser
        return { user: authUser }
    }


    async function signOut() {
        const { error } = await mockAuth.signOut()
        if (error) throw error
        user.value = null
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