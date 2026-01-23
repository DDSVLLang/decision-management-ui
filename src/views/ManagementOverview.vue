<template>
  <AppLayout>
    <div class="p-6">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Verwaltung</h2>
        <p class="mt-1 text-sm text-gray-600">Verwalten Sie Themen, Gremien und Fachbereiche</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <router-link
            to="/management/topics"
            class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-primary-100 rounded-lg">
              <TagIcon class="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Themen</h3>
          <p class="text-sm text-gray-600">Themen für Beschlüsse verwalten</p>
        </router-link>

        <router-link
            to="/management/committees"
            class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-primary-100 rounded-lg">
              <UserGroupIcon class="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Gremien</h3>
          <p class="text-sm text-gray-600">Beschlussgremien verwalten</p>
        </router-link>

        <router-link
            to="/management/departments"
            class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-primary-100 rounded-lg">
              <BuildingOfficeIcon class="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Fachbereiche</h3>
          <p class="text-sm text-gray-600">Zuständige Fachbereiche verwalten</p>
        </router-link>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { TagIcon, UserGroupIcon, BuildingOfficeIcon } from '@heroicons/vue/24/outline'
import AppLayout from '../components/AppLayout.vue'
</script>
