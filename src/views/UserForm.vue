<template>
  <AppLayout>
    <div class="p-6">
      <div class="mb-6">
        <button
            @click="handleCancel"
            class="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon class="h-5 w-5 mr-2" />
          {{ isEdit ? 'Zurück zu Benutzerdetails' : 'Zurück zur Benutzerliste' }}
        </button>
      </div>

      <div class="max-w-2xl">
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-200">
            <h2 class="text-2xl font-normal tracking-[0.08em] text-gray-600">
              {{ isEdit ? 'Benutzer bearbeiten' : 'Neuer Benutzer' }}
            </h2>
          </div>

          <form @submit.prevent="saveUser" class="px-6 py-5 space-y-6">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Vorname*</label>
                <input
                    v-model="form.firstName"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Vorname"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                <input
                    v-model="form.lastName"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nachname"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">E-Mail*</label>
              <input
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="benutzer@example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Passwort{{ isEdit ? '' : '*' }}
              </label>
              <div class="flex space-x-2">
                <input
                    v-model="form.password"
                    type="text"
                    :required="!isEdit"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    :placeholder="isEdit ? 'Leer lassen, um Passwort beizubehalten' : 'Passwort'"
                />
                <button
                    type="button"
                    @click="generatePassword"
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Generieren
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                {{ isEdit ? 'Nur ausfüllen, wenn das Passwort geändert werden soll' : 'Das generierte Passwort wird dem Benutzer zur Verfügung gestellt.' }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rolle*</label>
              <select
                  v-model="form.role"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="user">Benutzer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Organisationseinheit</label>
              <select
                  v-model="form.departmentId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Kein Organisationseinheit zugewiesen</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }} ({{ dept.shortName }})
                </option>
              </select>
            </div>

            <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-md">
              <p class="text-sm text-red-800">{{ errorMessage }}</p>
            </div>

            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                  type="button"
                  @click="handleCancel"
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                  type="submit"
                  :disabled="loading"
                  class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {{ loading ? 'Wird gespeichert...' : (isEdit ? 'Aktualisieren' : 'Erstellen') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUsersStore } from '../stores/users'
import { UsersApi, type CreateUserDto, type UpdateUserDto } from '../lib/usersApi'
import { DepartmentsApi, type DepartmentDto } from '../lib/departmentsApi'
import AppLayout from '../components/AppLayout.vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const usersStore = useUsersStore()

const loading = ref(false)
const errorMessage = ref('')
const departments = ref<DepartmentDto[]>([])

const isEdit = computed(() => !!route.params.id)
const userId = computed(() => route.params.id as string)
const user = computed(() =>
    isEdit.value ? usersStore.getUserById(userId.value) : null
)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'user' as 'admin' | 'user',
  departmentId: ''
})

function generatePassword() {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  form.value.password = password
}

function handleCancel() {
  if (isEdit.value) {
    router.push(`/users/${userId.value}`)
  } else {
    router.push('/users')
  }
}

async function saveUser() {
  loading.value = true
  errorMessage.value = ''

  try {
    if (isEdit.value) {
      const updateData: UpdateUserDto = {
        email: form.value.email,
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        role: form.value.role === 'admin' ? 'ADMIN' : 'USER',
        ...(form.value.departmentId && { departmentId: form.value.departmentId })
      }

      if (form.value.password) {
        updateData.password = form.value.password
      }

      const updatedUser = await UsersApi.updateUser(userId.value, updateData)

      await usersStore.fetchUsers()

      router.push(`/users/${updatedUser.id}`)
    } else {
      const createData: CreateUserDto = {
        email: form.value.email,
        password: form.value.password,
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        role: form.value.role === 'admin' ? 'ADMIN' : 'USER',
        ...(form.value.departmentId && { departmentId: form.value.departmentId })
      }

      const createdUser = await UsersApi.createUser(createData)

      await usersStore.fetchUsers()

      router.push(`/users/${createdUser.id}`)
    }
  } catch (error: any) {
    console.error('Error saving user:', error)
    errorMessage.value = error.message || 'Ein Fehler ist aufgetreten'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!authStore.isAdmin) {
    router.push('/')
    return
  }

  try {
    departments.value = await DepartmentsApi.getAll()
  } catch (error) {
    console.error('Error loading departments:', error)
  }

  if (usersStore.users.length === 0) {
    await usersStore.fetchUsers()
  }

  if (isEdit.value && user.value) {
    form.value = {
      firstName: user.value.firstName,
      lastName: user.value.lastName,
      email: user.value.email,
      password: '',
      role: user.value.role,
      departmentId: user.value.department?.id || ''
    }
  } else if (!isEdit.value) {
    generatePassword()
  }
})
</script>
