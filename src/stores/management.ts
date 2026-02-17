import { defineStore } from 'pinia'
import { ref } from 'vue'
import { TopicsApi, type TopicDto } from '../lib/topicsApi'
import { CommitteesApi, type CommitteeDto } from '../lib/committeesApi'
import {DepartmentsApi, type DepartmentDto} from "../lib/departmentsApi.ts";

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
    shortName?: string
    description?: string
    created_at: string
    updated_at: string
}

export interface Department {
    id: string
    name: string
    shortName?: string
    description?: string
    created_at: string
    updated_at: string
}

function mapTopicDtoToTopic(dto: TopicDto): Topic {
    return {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        created_at: dto.createdAt,
        updated_at: dto.updatedAt
    }
}

function mapCommitteeDtoToCommittee(dto: CommitteeDto): Committee {
    return {
        id: dto.id,
        name: dto.name,
        shortName: dto.shortName,
        description: dto.description,
        created_at: dto.createdAt,
        updated_at: dto.updatedAt
    }
}

function mapDepartmentDtoToDepartment(dto: DepartmentDto): Department {
    return {
        id: dto.id,
        name: dto.name,
        shortName: dto.shortName,
        description: dto.description,
        created_at: dto.createdAt,
        updated_at: dto.updatedAt
    }
}

export const useManagementStore = defineStore('management', () => {
    const topics = ref<Topic[]>([])
    const committees = ref<Committee[]>([])
    const departments = ref<Department[]>([])
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
        try {
            const committeeDto = await CommitteesApi.getAll()
            committees.value = committeeDto.map(mapCommitteeDtoToCommittee)
            committees.value.sort((a, b) => a.name.localeCompare(b.name))
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Fehler beim Laden der Gremien'
            console.error('Error loading committee:', err)
        } finally {
            loading.value = false
        }
    }

    async function addCommittee(name: string, shortName: string, description?: string) {
        loading.value = true
        error.value = null
        try {
            const committeeDto = await CommitteesApi.create({ name, shortName, description })
            const newCommittee = mapCommitteeDtoToCommittee(committeeDto)
            committees.value.push(newCommittee)
            committees.value.sort((a, b) => a.name.localeCompare(b.name))
            return newCommittee
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Fehler beim Hinzufügen des Gremiums'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateCommittee(id: string, name: string, shortName: string, description?: string) {
        loading.value = true
        error.value = null
        try {
            const committeeDto = await CommitteesApi.update(id, { name, shortName, description })
            const updatedCommittee = mapCommitteeDtoToCommittee(committeeDto)
            const index = committees.value.findIndex(t => t.id === id)
            if (index !== -1) {
                committees.value[index] = updatedCommittee
                committees.value.sort((a, b) => a.name.localeCompare(b.name))
            }
            return updatedCommittee
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Gremiums'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteCommittee(id: string) {
        loading.value = true
        error.value = null
        try {
            await CommitteesApi.delete(id)
            committees.value = committees.value.filter(t => t.id !== id)
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Fehler beim Löschen des Gremiums'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function loadDepartments() {
        loading.value = true
        error.value = null
        try {
            const departmentsDto = await DepartmentsApi.getAll()
            departments.value = departmentsDto.map(mapDepartmentDtoToDepartment)
            departments.value.sort((a, b) => a.name.localeCompare(b.name))
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Fehler beim Laden der Fachdienste'
            console.error('Error loading departments:', err)
        } finally {
            loading.value = false
        }
    }

    async function addDepartment(name: string, shortName?: string, description?: string) {
        loading.value = true
        error.value = null
        try {
            const departmentDto = await DepartmentsApi.create({ name, shortName, description })
            const newDepartment = mapDepartmentDtoToDepartment(departmentDto)
            departments.value.push(newDepartment)
            departments.value.sort((a, b) => a.name.localeCompare(b.name))
            return newDepartment
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Fehler beim Hinzufügen des Fachdienstes'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateDepartment(id: string, name: string, shortName?: string, description?: string) {
        loading.value = true
        error.value = null
        try {
            const departmentDto = await DepartmentsApi.update(id, { name, shortName, description })
            const updatedDepartment = mapDepartmentDtoToDepartment(departmentDto)
            const index = departments.value.findIndex(t => t.id === id)
            if (index !== -1) {
                departments.value[index] = updatedDepartment
                departments.value.sort((a, b) => a.name.localeCompare(b.name))
            }
            return updatedDepartment
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Fachdienstes'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteDepartment(id: string) {
        loading.value = true
        error.value = null
        try {
            await DepartmentsApi.delete(id)
            departments.value = departments.value.filter(t => t.id !== id)
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Fehler beim Löschen des Fachdienstes'
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
