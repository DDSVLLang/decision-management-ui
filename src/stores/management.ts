import { defineStore } from 'pinia'
import { ref } from 'vue'
import { TopicsApi, type TopicDto } from '../lib/topicsApi'

export interface Topic {
    id: string
    name: string
    description?: string
    created_at: string
    updated_at: string
}

export interface Committee {
    id: string
    name: string
    shortName: string
    description?: string
    created_at: string
    updated_at: string
}

export interface Department {
    id: string
    name: string
    shortName: string
    description?: string
    created_at: string
    updated_at: string
}

const generateId = () => Math.random().toString(36).substring(2, 9)

function mapTopicDtoToTopic(dto: TopicDto): Topic {
    return {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        created_at: dto.createdAt,
        updated_at: dto.updatedAt
    }
}

const mockCommittees: Committee[] = [
    { id: '1', name: 'Stadtverordnetenversammlung', shortName: 'STVV', description: 'Hauptorgan der kommunalen Selbstverwaltung', created_at: '2024-01-10T08:00:00Z', updated_at: '2024-01-10T08:00:00Z' },
    { id: '2', name: 'Haupt- und Finanzausschuss', shortName: 'HFA', description: 'Beratung über Haushalt und Finanzen', created_at: '2024-01-12T10:00:00Z', updated_at: '2024-01-12T10:00:00Z' },
    { id: '3', name: 'Bauausschuss', shortName: 'BA', description: 'Entscheidungen zu Bauprojekten und Stadtplanung', created_at: '2024-01-15T13:00:00Z', updated_at: '2024-01-15T13:00:00Z' },
    { id: '4', name: 'Sozialausschuss', shortName: 'SA', description: 'Soziale Angelegenheiten und Wohlfahrt', created_at: '2024-02-01T15:30:00Z', updated_at: '2024-02-01T15:30:00Z' },
    { id: '5', name: 'Kulturausschuss', shortName: 'KA', description: 'Kulturelle Angelegenheiten und Veranstaltungen', created_at: '2024-02-05T09:45:00Z', updated_at: '2024-02-05T09:45:00Z' },
    { id: '6', name: 'Umweltausschuss', shortName: 'UA', description: 'Umweltschutz und Klimaschutzmaßnahmen', created_at: '2024-02-10T14:20:00Z', updated_at: '2024-02-10T14:20:00Z' },
]

const mockDepartments: Department[] = [
    { id: '1', name: 'Zentrale Dienste', shortName: 'FD 10', description: 'Organisation, Personal, IT-Services', created_at: '2024-01-08T09:00:00Z', updated_at: '2024-01-08T09:00:00Z' },
    { id: '2', name: 'Stadtplanung und Verkehr', shortName: 'FD 13', description: 'Stadtentwicklung, Verkehrsplanung, Radverkehrskonzepte', created_at: '2024-01-08T09:30:00Z', updated_at: '2024-01-08T09:30:00Z' },
    { id: '3', name: 'Bauverwaltung', shortName: 'FD 20', description: 'Hochbau, Tiefbau, Gebäudemanagement', created_at: '2024-01-08T10:00:00Z', updated_at: '2024-01-08T10:00:00Z' },
    { id: '4', name: 'Bildung und Kultur', shortName: 'FD 30', description: 'Schulen, Kindertagesstätten, Kulturförderung', created_at: '2024-01-08T10:30:00Z', updated_at: '2024-01-08T10:30:00Z' },
    { id: '5', name: 'Soziales und Gesundheit', shortName: 'FD 40', description: 'Sozialleistungen, Gesundheitsamt, Seniorenbetreuung', created_at: '2024-01-08T11:00:00Z', updated_at: '2024-01-08T11:00:00Z' },
    { id: '6', name: 'Umwelt und Klimaschutz', shortName: 'FD 50', description: 'Umweltschutz, Klimaschutzkonzepte, Grünflächenpflege', created_at: '2024-01-08T11:30:00Z', updated_at: '2024-01-08T11:30:00Z' },
    { id: '7', name: 'Stadtwerke', shortName: 'FD 60', description: 'Energie, Wasser, Straßenbeleuchtung', created_at: '2024-01-08T12:00:00Z', updated_at: '2024-01-08T12:00:00Z' },
    { id: '8', name: 'Sport und Freizeit', shortName: 'FD 70', description: 'Sportanlagen, Hallenbäder, Freizeiteinrichtungen', created_at: '2024-01-08T12:30:00Z', updated_at: '2024-01-08T12:30:00Z' },
]

export const useManagementStore = defineStore('management', () => {
    const topics = ref<Topic[]>([])
    const committees = ref<Committee[]>([...mockCommittees])
    const departments = ref<Department[]>([...mockDepartments])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function loadTopics() {
        loading.value = true
        error.value = null
        try {
            const topicsDto = await TopicsApi.getAll()
            topics.value = topicsDto.map(mapTopicDtoToTopic)
            topics.value.sort((a, b) => a.name.localeCompare(b.name))
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Fehler beim Laden der Themen'
            console.error('Error loading topics:', err)
        } finally {
            loading.value = false
        }
    }

    async function addTopic(name: string, description?: string) {
        loading.value = true
        error.value = null
        try {
            const topicDto = await TopicsApi.create({ name, description })
            const newTopic = mapTopicDtoToTopic(topicDto)
            topics.value.push(newTopic)
            topics.value.sort((a, b) => a.name.localeCompare(b.name))
            return newTopic
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Fehler beim Hinzufügen des Themas'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateTopic(id: string, name: string, description?: string) {
        loading.value = true
        error.value = null
        try {
            const topicDto = await TopicsApi.update(id, { name, description })
            const updatedTopic = mapTopicDtoToTopic(topicDto)
            const index = topics.value.findIndex(t => t.id === id)
            if (index !== -1) {
                topics.value[index] = updatedTopic
                topics.value.sort((a, b) => a.name.localeCompare(b.name))
            }
            return updatedTopic
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Themas'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteTopic(id: string) {
        loading.value = true
        error.value = null
        try {
            await TopicsApi.delete(id)
            topics.value = topics.value.filter(t => t.id !== id)
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Fehler beim Löschen des Themas'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function loadCommittees() {
        loading.value = true
        error.value = null
        await new Promise(resolve => setTimeout(resolve, 300))
        loading.value = false
    }

    async function addCommittee(name: string, shortName: string, description?: string) {
        loading.value = true
        error.value = null
        try {
            await new Promise(resolve => setTimeout(resolve, 300))
            const newCommittee: Committee = {
                id: generateId(),
                name,
                shortName,
                description,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            committees.value.push(newCommittee)
            committees.value.sort((a, b) => a.name.localeCompare(b.name))
            return newCommittee
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to add committee'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateCommittee(id: string, name: string, shortName: string, description?: string) {
        loading.value = true
        error.value = null
        try {
            await new Promise(resolve => setTimeout(resolve, 300))
            const index = committees.value.findIndex(c => c.id === id)
            if (index !== -1) {
                committees.value[index] = {
                    ...committees.value[index],
                    name,
                    shortName,
                    description,
                    updated_at: new Date().toISOString()
                }
                committees.value.sort((a, b) => a.name.localeCompare(b.name))
                return committees.value[index]
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to update committee'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteCommittee(id: string) {
        loading.value = true
        error.value = null
        try {
            await new Promise(resolve => setTimeout(resolve, 300))
            committees.value = committees.value.filter(c => c.id !== id)
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to delete committee'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function loadDepartments() {
        loading.value = true
        error.value = null
        await new Promise(resolve => setTimeout(resolve, 300))
        loading.value = false
    }

    async function addDepartment(name: string, shortName: string, description?: string) {
        loading.value = true
        error.value = null
        try {
            await new Promise(resolve => setTimeout(resolve, 300))
            const newDepartment: Department = {
                id: generateId(),
                name,
                shortName,
                description,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            departments.value.push(newDepartment)
            departments.value.sort((a, b) => a.name.localeCompare(b.name))
            return newDepartment
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to add department'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateDepartment(id: string, name: string, shortName: string, description?: string) {
        loading.value = true
        error.value = null
        try {
            await new Promise(resolve => setTimeout(resolve, 300))
            const index = departments.value.findIndex(d => d.id === id)
            if (index !== -1) {
                departments.value[index] = {
                    ...departments.value[index],
                    name,
                    shortName,
                    description,
                    updated_at: new Date().toISOString()
                }
                departments.value.sort((a, b) => a.name.localeCompare(b.name))
                return departments.value[index]
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to update department'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteDepartment(id: string) {
        loading.value = true
        error.value = null
        try {
            await new Promise(resolve => setTimeout(resolve, 300))
            departments.value = departments.value.filter(d => d.id !== id)
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to delete department'
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        topics,
        committees,
        departments,
        loading,
        error,
        loadTopics,
        addTopic,
        updateTopic,
        deleteTopic,
        loadCommittees,
        addCommittee,
        updateCommittee,
        deleteCommittee,
        loadDepartments,
        addDepartment,
        updateDepartment,
        deleteDepartment
    }
})
