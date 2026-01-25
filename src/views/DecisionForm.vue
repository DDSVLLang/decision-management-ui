<template>
  <AppLayout>
    <div class="p-6">
      <div class="mb-6">
        <button
            @click="handleCancel"
            class="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon class="h-5 w-5 mr-2" />
          {{ isEdit ? 'Zurück zu Beschlussdetails' : 'Zurück zur Übersicht' }}
        </button>
      </div>

      <div class="max-w-4xl">
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-200">
            <h2 class="text-2xl font-normal tracking-[0.08em] text-gray-600">
              {{ isEdit ? 'Beschluss bearbeiten' : 'Neuer Beschluss' }}
            </h2>
          </div>

          <form @submit.prevent="saveDecision" class="px-6 py-5 space-y-6">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Beschlussgremium*</label>
                <select
                    v-model="form.decisionBody"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Bitte wählen</option>
                  <option v-for="committee in committees" :key="committee" :value="committee">
                    {{ committee }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Beschlussdatum*</label>
                <input
                    v-model="form.decisionDate"
                    type="date"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Drucksache*</label>
                <input
                    v-model="form.printMatter"
                    type="text"
                    required
                    placeholder="z.B. 265-1/XVIII/17"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Zuständiger Fachbereich*</label>
                <select
                    v-model="form.responsibleDepartment"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Bitte wählen</option>
                  <option v-for="dept in departments" :key="dept" :value="dept">
                    {{ dept }}
                  </option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Thema*</label>
                <select
                    v-model="form.topic"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Bitte wählen</option>
                  <option v-for="topic in topics" :key="topic" :value="topic">
                    {{ topic }}
                  </option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Betreff*</label>
                <input
                    v-model="form.title"
                    type="text"
                    required
                    placeholder="Kurzbeschreibung des Beschlusses"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Beschlusstext*</label>
                <textarea
                    v-model="form.content"
                    rows="8"
                    required
                    placeholder="Vollständiger Beschlusstext"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fälligkeitsdatum</label>
                <input
                    v-model="form.dueDate"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Umsetzungshinweise</label>
                <textarea
                    v-model="form.implementationNotes"
                    rows="3"
                    placeholder="Hinweise zur Umsetzung"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
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
import { useDecisionStore } from '../stores/decisions'
import AppLayout from '../components/AppLayout.vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const store = useDecisionStore()

const loading = ref(false)
const errorMessage = ref('')

const isEdit = computed(() => !!route.params.id)
const decisionId = computed(() => route.params.id ? parseInt(route.params.id as string) : null)
const decision = computed(() =>
    isEdit.value && decisionId.value ? store.decisions.find(d => d.id === decisionId.value) : null
)

const committees = computed(() => store.committees)
const departments = computed(() => store.departments)
const topics = computed(() => store.topics)

const form = ref({
  title: '',
  decisionBody: '',
  decisionDate: '',
  printMatter: '',
  responsibleDepartment: '',
  topic: '',
  content: '',
  dueDate: '',
  implementationNotes: ''
})

function handleCancel() {
  if (isEdit.value && decisionId.value) {
    router.push(`/decisions/${decisionId.value}`)
  } else {
    router.push('/')
  }
}

async function saveDecision() {
  if (!authStore.isAdmin) {
    errorMessage.value = 'Nur Administratoren können Beschlüsse erstellen oder bearbeiten.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, 300))

    const decisionData = {
      title: form.value.title,
      decisionBody: form.value.decisionBody,
      decisionDate: form.value.decisionDate,
      printMatter: form.value.printMatter,
      responsibleDepartment: form.value.responsibleDepartment,
      topic: form.value.topic,
      content: form.value.content,
      dueDate: form.value.dueDate || undefined,
      implementationNotes: form.value.implementationNotes || undefined
    }

    if (isEdit.value && decisionId.value) {
      store.updateDecision(decisionId.value, decisionData)
      router.push(`/decisions/${decisionId.value}`)
    } else {
      const newDecision = store.addDecision(decisionData)
      router.push(`/decisions/${newDecision.id}`)
    }
  } catch (error: any) {
    console.error('Error saving decision:', error)
    errorMessage.value = error.message || 'Ein Fehler ist aufgetreten'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!authStore.isAdmin) {
    router.push('/')
    return
  }

  if (isEdit.value && decision.value) {
    form.value = {
      title: decision.value.title,
      decisionBody: decision.value.decisionBody,
      decisionDate: decision.value.decisionDate,
      printMatter: decision.value.printMatter,
      responsibleDepartment: decision.value.responsibleDepartment,
      topic: decision.value.topic,
      content: decision.value.content,
      dueDate: decision.value.dueDate || '',
      implementationNotes: decision.value.implementationNotes || ''
    }
  }
})
</script>