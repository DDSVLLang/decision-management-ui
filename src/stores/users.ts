import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AppUser {
    id: string
    first_name: string
    last_name: string
    email: string
    password: string
    role: 'admin' | 'user'
    responsibleDepartment?: string
    created_at: string
    updated_at: string
    created_by?: string
}

export const useUsersStore = defineStore('users', () => {
    const users = ref<AppUser[]>([
        {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            created_at: new Date('2024-01-01').toISOString(),
            updated_at: new Date('2024-01-01').toISOString()
        },
        {
            id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
            first_name: 'Normal',
            last_name: 'User',
            email: 'user1@example.com',
            password: 'user123',
            role: 'user',
            responsibleDepartment: 'FD 13',
            created_at: new Date('2024-01-02').toISOString(),
            updated_at: new Date('2024-01-02').toISOString(),
            created_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        },
        {
            id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
            first_name: 'Normal',
            last_name: 'User',
            email: 'user2@example.com',
            password: 'user234',
            role: 'user',
            responsibleDepartment: 'FD 30',
            created_at: new Date('2024-01-02').toISOString(),
            updated_at: new Date('2024-01-02').toISOString(),
            created_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        },
        {
            id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
            first_name: 'Anna',
            last_name: 'Müller',
            email: 'anna.mueller@example.com',
            password: 'secure789',
            role: 'user',
            responsibleDepartment: 'FD 20',
            created_at: new Date('2024-02-10').toISOString(),
            updated_at: new Date('2024-02-10').toISOString(),
            created_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        },
        {
            id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
            first_name: 'Michael',
            last_name: 'Schmidt',
            email: 'michael.schmidt@example.com',
            password: 'pass456',
            role: 'user',
            responsibleDepartment: 'FD 30',
            created_at: new Date('2024-02-15').toISOString(),
            updated_at: new Date('2024-03-20').toISOString(),
            created_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        },
        {
            id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
            first_name: 'Sarah',
            last_name: 'Weber',
            email: 'sarah.weber@example.com',
            password: 'mypass123',
            role: 'admin',
            created_at: new Date('2024-03-01').toISOString(),
            updated_at: new Date('2024-03-01').toISOString(),
            created_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        },
        {
            id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
            first_name: 'Thomas',
            last_name: 'Becker',
            email: 'thomas.becker@example.com',
            password: 'test789',
            role: 'user',
            responsibleDepartment: 'FD 40',
            created_at: new Date('2024-03-10').toISOString(),
            updated_at: new Date('2024-04-05').toISOString(),
            created_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        },
        {
            id: 'g6eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
            first_name: 'Laura',
            last_name: 'Hoffmann',
            email: 'laura.hoffmann@example.com',
            password: 'laura2024',
            role: 'user',
            responsibleDepartment: 'FD 50',
            created_at: new Date('2024-04-15').toISOString(),
            updated_at: new Date('2024-04-15').toISOString(),
            created_by: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'
        },
        {
            id: 'h7eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
            first_name: 'David',
            last_name: 'Fischer',
            email: 'david.fischer@example.com',
            password: 'david123',
            role: 'user',
            responsibleDepartment: 'FD 60',
            created_at: new Date('2024-05-01').toISOString(),
            updated_at: new Date('2024-05-01').toISOString(),
            created_by: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'
        },
        {
            id: 'i8eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
            first_name: 'Julia',
            last_name: 'Koch',
            email: 'julia.koch@example.com',
            password: 'julia456',
            role: 'user',
            responsibleDepartment: 'FD 70',
            created_at: new Date('2024-06-10').toISOString(),
            updated_at: new Date('2024-06-10').toISOString(),
            created_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        },
        {
            id: 'j9eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
            first_name: 'Martin',
            last_name: 'Wagner',
            email: 'martin.wagner@example.com',
            password: 'martin789',
            role: 'user',
            responsibleDepartment: 'FD 13',
            created_at: new Date('2024-07-15').toISOString(),
            updated_at: new Date('2024-08-01').toISOString(),
            created_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        }
    ])

    function addUser(userData: Omit<AppUser, 'id' | 'created_at' | 'updated_at'>) {
        const newUser: AppUser = {
            ...userData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
        users.value.push(newUser)
        return newUser
    }

    function updateUser(id: string, userData: Partial<AppUser>) {
        const index = users.value.findIndex(u => u.id === id)
        if (index !== -1) {
            users.value[index] = {
                ...users.value[index],
                ...userData,
                updated_at: new Date().toISOString()
            }
            return users.value[index]
        }
        return null
    }

    function deleteUser(id: string) {
        const index = users.value.findIndex(u => u.id === id)
        if (index !== -1) {
            users.value.splice(index, 1)
            return true
        }
        return false
    }

    function getUserByEmail(email: string) {
        return users.value.find(u => u.email === email)
    }

    return {
        users,
        addUser,
        updateUser,
        deleteUser,
        getUserByEmail
    }
})
