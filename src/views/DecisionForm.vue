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
            <h2 class="text-2xl font-bold text-gray-900">
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

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Zuständige Fachbereiche* (mindestens einen auswählen)</label>
                <Listbox v-model="form.responsibleDepartments" multiple>
                  <div class="relative">
                    <ListboxButton
                        class="relative w-full cursor-pointer rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <span v-if="form.responsibleDepartments.length === 0" class="block truncate text-gray-400">
                        Fachbereiche auswählen...
                      </span>
                      <span v-else class="flex flex-wrap gap-1">
                        <span
                            v-for="dept in form.responsibleDepartments"
                            :key="dept"
                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {{ dept }}
                        </span>
                      </span>
                      <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </ListboxButton>

                    <transition
                        leave-active-class="transition duration-100 ease-in"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                    >
                      <ListboxOptions
                          class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      >
                        <ListboxOption
                            v-for="dept in departments"
                            :key="dept"
                            :value="dept"
                            v-slot="{ active, selected }"
                            as="template"
                        >
                          <li
                              :class="[
                                active ? 'bg-primary-100 text-primary-900' : 'text-gray-900',
                                'relative cursor-pointer select-none py-2 pl-10 pr-4'
                              ]"
                          >
                            <span
                                :class="[
                                  selected ? 'font-medium' : 'font-normal',
                                  'block truncate'
                                ]"
                            >
                              {{ dept }}
                            </span>
                            <span
                                v-if="selected"
                                class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600"
                            >
                              <CheckIcon class="h-5 w-5" aria-hidden="true" />
                            </span>
                          </li>
                        </ListboxOption>
                      </ListboxOptions>
                    </transition>
                  </div>
                </Listbox>
                <p v-if="form.responsibleDepartments.length === 0" class="mt-1 text-sm text-red-600">
                  Bitte mindestens einen Fachbereich auswählen
                </p>
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
import { ArrowLeftIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/24/outline'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const store = useDecisionStore()

const loading = ref(false)
const errorMessage = ref('')

const isEdit = computed(() => !!route.params.id)
const decisionId = computed(() => route.params.id ? route.params.id as string : null)
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
  responsibleDepartments: [] as string[],
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

  if (form.value.responsibleDepartments.length === 0) {
    errorMessage.value = 'Bitte mindestens einen Fachbereich auswählen.'
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
      responsibleDepartment: form.value.responsibleDepartments[0],
      responsibleDepartments: form.value.responsibleDepartments,
      topic: form.value.topic,
      content: form.value.content,
      dueDate: form.value.dueDate || undefined,
      implementationNotes: form.value.implementationNotes || undefined,
      departments: [],
      priority: 'medium',
      deleted: false
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
      responsibleDepartments: decision.value.responsibleDepartments || [decision.value.responsibleDepartment],
      topic: decision.value.topic,
      content: decision.value.content,
      dueDate: decision.value.dueDate || '',
      implementationNotes: decision.value.implementationNotes || ''
    }
  }
})
</script>